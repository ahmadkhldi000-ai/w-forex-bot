//+------------------------------------------------------------------+
//| W_Forex_Bot.mq5                                                  |
//| Clean, modular orchestrator — strategy logic preserved from      |
//| Quantum_M1_Inst_DCA_v9.3 (v9.30)                                 |
//|                                                                  |
//| This file is intentionally thin: it only wires the modules       |
//| together via OnInit / OnTick / OnTradeTransaction / OnDeinit.    |
//| All strategy, risk, and exit logic lives in Include/WBot/*.mqh   |
//| and is byte-for-byte equivalent to the original.                 |
//+------------------------------------------------------------------+
#property strict
#property copyright "W Forex Bot"
#property link      "https://wforexbot.com"
#property description "W Forex Bot — 3-Tier Clean Execution (modular)"
#property version   "9.31"

//--- configuration (inputs) -----------------------------------------
#include "WBot/WBot_Config.mqh"
//--- core modules ----------------------------------------------------
#include "WBot/WBot_Logger.mqh"
#include "WBot/WBot_Indicators.mqh"
#include "WBot/WBot_Telegram.mqh"
#include "WBot/WBot_Signals.mqh"
#include "WBot/WBot_Risk.mqh"
#include "WBot/WBot_DcaGrid.mqh"
#include "WBot/WBot_Performance.mqh"
#include "WBot/WBot_WebConnector.mqh"
#include "WBot/WBot_Execution.mqh"
#include "WBot/WBot_Exits.mqh"

//====================================================================
//  BOT-SCOPED STATE
//====================================================================
datetime g_lastBarTime     = 0;   // for IsNewBar()
datetime g_lastCloseBarTime = 0;  // for cooldown
double   g_peakEquity      = 0;   // cosmetic dashboard peak

//--------------------------------------------------------------------
//  Local helpers (tiny, non-strategic)
//--------------------------------------------------------------------
string TimeStr()
  {
   return TimeToString(TimeCurrent(), TIME_DATE|TIME_MINUTES|TIME_SECONDS);
  }

bool IsNewBar()
  {
   datetime cb = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(cb != g_lastBarTime)
     {
      g_lastBarTime = cb;
      return true;
     }
   return false;
  }

int BarsSinceTime(datetime time)
  {
   if(time <= 0) return 999;
   return Bars(_Symbol, PERIOD_CURRENT, time, TimeCurrent());
  }

bool IsCooldownOver()
  {
   return (BarsSinceTime(g_lastCloseBarTime) >= InpCooldownBars);
  }

void ActivateCooldown()
  {
   g_lastCloseBarTime = iTime(_Symbol, PERIOD_CURRENT, 0);
  }

//====================================================================
//  DASHBOARD (cosmetic Comment(); preserved from original)
//====================================================================
void UpdateChartDashboard()
  {
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   if(eq > g_peakEquity)
      g_peakEquity = eq;

   string dir = (WGrid.Direction() == 1)  ? "📈 LONG"
              : (WGrid.Direction() == -1) ? "📉 SHORT"
                                          : "⏳ SCANNING";

   string cd = "✅";
   if(g_lastCloseBarTime > 0 && !IsCooldownOver())
     {
      int left = InpCooldownBars - BarsSinceTime(g_lastCloseBarTime);
      cd = "⏳ " + IntegerToString(MathMax(left, 0)) + " mins";
     }

   Comment("═══════════════════════════════\n ⚡ W Forex Bot\n═══════════════════════════════\n "
           + dir + "\n 🔢 Pos: " + IntegerToString(WExec.CountTrades()) + "/"
           + IntegerToString(InpMaxOpenTrades) + "\n 💎 Eq: $" + DoubleToString(eq, 2)
           + "\n 🔄 Cooldown: " + cd + "\n═══════════════════════════════");
  }

//====================================================================
//  SIGNAL EVALUATION (single direction-entry decision, preserved)
//====================================================================
void EvaluateEntryOnNewBar(double price, double vwap)
  {
   bool buySignal  = false;
   bool sellSignal = false;

   //--- BUY: price > VWAP (when filter on) + buy imbalance candle ----
   if((!InpUseVWAP_Filter || price > vwap) &&
      WSignals.IsBuyImbalance(InpUseTickImbalance, InpImbalance_Threshold, 1))
      buySignal = true;

   //--- SELL: imbalance + flexible VWAP bias -------------------------
   if(WSignals.IsSellImbalance(InpUseTickImbalance, InpImbalance_Threshold, 1))
     {
      if(!InpUseVWAP_Filter || price < vwap)
         sellSignal = true;
      else if(price > vwap && price <= (vwap + InpVWAP_Allowance_Pts * _Point))
         sellSignal = true;
     }

   if(buySignal && WExec.CountTrades() == 0)
     {
      WGrid.InitializeZones(1, 0, InpDCA_BaseStep_ATR_Mult);
      WExec.ExecuteBuy(0);
     }
   else if(sellSignal && WExec.CountTrades() == 0)
     {
      WGrid.InitializeZones(-1, 0, InpDCA_BaseStep_ATR_Mult);
      WExec.ExecuteSell(0);
     }
  }

//====================================================================
//  EVENT HANDLERS
//====================================================================

//+------------------------------------------------------------------+
//| OnInit                                                            |
//+------------------------------------------------------------------+
int OnInit()
  {
   //--- configure logging --------------------------------------------
   WLog.SetMinLevel(WBOT_LOG_INFO);

   //--- indicators / signals / risk / grid --------------------------
   if(!WIndicators.Init(_Symbol))
      return INIT_FAILED;

   WSignals.Init(_Symbol);
   WRisk.Init(_Symbol);
   WGrid.Init(_Symbol, InpMaxDCA_Levels);

   //--- execution + exits --------------------------------------------
   WExec.Init(_Symbol, InpMagicNumber, InpMaxOpenTrades, InpMaxSpreadPoints);
   WExits.Init(_Symbol, InpMagicNumber);

   //--- Telegram -----------------------------------------------------
   WTelegram.Configure(InpTelegramToken, InpTelegramChatID, InpEnableTelegram);

   //--- internal performance monitor --------------------------------
   WPerf.Init(_Symbol, InpMonitorIntervalSec);

   //--- Web Connector ------------------------------------------------
   WWeb.Configure(InpEnableWebConnector, InpAPI_URL, InpAPI_KEY,
                  InpWebConnectorTimeoutMs, InpUPDATE_INTERVAL,
                  _Symbol, InpMagicNumber);

   //--- init time trackers ------------------------------------------
   g_lastBarTime = iTime(_Symbol, PERIOD_CURRENT, 0);
   g_peakEquity  = AccountInfoDouble(ACCOUNT_EQUITY);

   //--- announce boot ------------------------------------------------
   WTelegram.Send("W Forex Bot\n━━━━━━━━━━━━━━━━━━━━\n🟢 Status: Active\n📊 Symbol: "
                  + _Symbol + "\n💰 Equity: $" + DoubleToString(g_peakEquity, 2)
                  + "\n🕐 " + TimeStr());

   WWeb.EmitConnection("connected", "EA started on " + _Symbol);

   WLog.Info(StringFormat("OnInit OK | symbol=%s magic=%I64u version=9.31",
                          _Symbol, InpMagicNumber));
   return INIT_SUCCEEDED;
  }

//+------------------------------------------------------------------+
//| OnTick                                                            |
//+------------------------------------------------------------------+
void OnTick()
  {
   uint tickStart = GetTickCount();

   //--- 1) dashboard (every tick) ------------------------------------
   UpdateChartDashboard();

   //--- spread gate --------------------------------------------------
   if(!IsSpreadOK_Symbol())
      return;

   //--- 2) exit management (preserved) -------------------------------
   WExits.ManageSmartScaleOut();
   WExits.ManageATRTrailing();

   //--- 3) entry/DCA logic (preserved) -------------------------------
   double price  = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double vwap   = WSignals.GetVWAP(InpUseVWAP_Filter);
   bool   newBar = IsNewBar();

   if(WGrid.Direction() == 0)
     {
      // scanning for a fresh first entry
      if(!IsCooldownOver())
         return;

      if(newBar)
         EvaluateEntryOnNewBar(price, vwap);
     }
   else if(WGrid.Direction() == 1)
     {
      // long DCA: add levels as price falls into buy zones
      if(newBar)
        {
         for(int i = 1; i < WGrid.MaxLevels(); i++)
           {
            if(!WGrid.BuyTriggered(i) && price <= WGrid.BuyZone(i))
               WExec.ExecuteBuy(i);
           }
        }
     }
   else if(WGrid.Direction() == -1)
     {
      // short DCA: add levels as price rises into sell zones
      if(newBar)
        {
         for(int i = 1; i < WGrid.MaxLevels(); i++)
           {
            if(!WGrid.SellTriggered(i) && price >= WGrid.SellZone(i))
               WExec.ExecuteSell(i);
           }
        }
     }

   //--- 4) additive telemetry (does not affect trading) -------------
   //   Tick latency + periodic monitor report; the Web Connector runs
   //   its own throttled full sync (account + all open trades) every
   //   InpUPDATE_INTERVAL seconds. Never blocks the bot.
   uint elapsed = GetTickCount() - tickStart;
   WPerf.RecordTickMs(elapsed);
   WPerf.MaybeReport();
   WWeb.MaybeFullSync();
   }

//+------------------------------------------------------------------+
//| OnTradeTransaction                                                |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest    &request,
                        const MqlTradeResult     &result)
  {
   //=================================================================
   // 1) POSITION MODIFIED (SL/TP/volume change) -> immediate push
   //    Covers both our own tier-edits and external modifications.
   //=================================================================
   if(trans.type == TRADE_TRANSACTION_POSITION)
     {
      ulong ticket = trans.position;
      if(ticket != 0 && PositionSelectByTicket(ticket) &&
         PositionGetString(POSITION_SYMBOL) == _Symbol &&
         PositionGetInteger(POSITION_MAGIC) == InpMagicNumber)
        {
         WWeb.EmitTradeModify(ticket);
        }
      return;
     }

   //=================================================================
   // 2) DEAL ADDED -> classify as OPEN or CLOSE
   //=================================================================
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD)
      return;

   // skip our own partial closes (suppressCloseNotify)
   if(WExits.SuppressCloseNotify())
      return;

   HistorySelect(0, TimeCurrent());
   int total = HistoryDealsTotal();
   if(total <= 0)
      return;

   ulong dealTicket = trans.deal;
   if(dealTicket == 0)
      dealTicket = HistoryDealGetTicket(total - 1);

   if(dealTicket == 0 ||
      !HistoryDealSelect(dealTicket) ||
      HistoryDealGetString(dealTicket, DEAL_SYMBOL) != _Symbol ||
      HistoryDealGetInteger(dealTicket, DEAL_MAGIC) != InpMagicNumber)
      return;

   ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dealTicket, DEAL_ENTRY);

   //=================================================================
   // 2a) TRADE OPENED
   //=================================================================
   if(entry == DEAL_ENTRY_IN)
     {
      ulong posId = (ulong)HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
      WWeb.EmitTradeOpen(posId);
      WLog.Debug(StringFormat("WebConnector: trade_open position=%s",
                              IntegerToString((long)posId)));
      return;
     }

   //=================================================================
   // 2b) TRADE CLOSED (full / partial exit)
   //=================================================================
   if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_OUT_BY)
      return;

   double profit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);

   //--- record into internal monitor ---------------------------------
   WPerf.RecordTradeClose(profit);

   //--- notify Telegram (preserved) ----------------------------------
   if(profit >= 0)
      WTelegram.Send("✅ Position Closed\n💵 Profit: +$" + DoubleToString(profit, 2)
                     + "\n💰 Equity: $" + DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY), 2)
                     + "\n🕐 " + TimeStr());
   else
      WTelegram.Send("❌ Position Closed\n💵 Loss: -$" + DoubleToString(MathAbs(profit), 2)
                     + "\n💰 Equity: $" + DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY), 2)
                     + "\n🕐 " + TimeStr());

   //--- emit closed trade to external platform (immediate) ----------
   WWeb.EmitTradeClose(dealTicket);

   //--- full flatten -> arm cooldown + reset grid -------------------
   if(WExec.CountTrades() == 0)
     {
      ActivateCooldown();
      WGrid.ResetZones();
     }
  }

//+------------------------------------------------------------------+
//| OnDeinit                                                          |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   Comment("");

   //--- final monitor report -----------------------------------------
   WPerf.MaybeReport(true);

   WIndicators.Deinit();

   //--- announce shutdown --------------------------------------------
   WTelegram.Send("W Forex Bot\n━━━━━━━━━━━━━━━━━━━━\n🛑 Status: Offline\n💎 Peak Equity: $"
                  + DoubleToString(g_peakEquity, 2) + "\n🕐 " + TimeStr());

   WWeb.FullSync();
   WWeb.EmitConnection("disconnected", "EA stopped");

   WLog.Info(StringFormat("OnDeinit reason=%d | trades=%d W/L=%d/%d PnL=$%.2f DD=%.2f%%",
                          reason, WPerf.TotalTrades(), WPerf.Wins(), WPerf.Losses(),
                          WPerf.TotalProfit(), WPerf.MaxDrawdownPct()));
   if(WWeb.IsEnabled())
      WLog.Info(StringFormat("WebConnector: sent=%d failed=%d online=%s",
                             WWeb.EventsSent(), WWeb.EventsFailed(),
                             WWeb.IsOnline() ? "yes" : "no"));
  }

//+------------------------------------------------------------------+
//| Local spread helper (kept thin to avoid module re-declaration)   |
//+------------------------------------------------------------------+
bool IsSpreadOK_Symbol()
  {
   return (WIndicators.CurrentSpread() <= InpMaxSpreadPoints);
  }
//+------------------------------------------------------------------+
