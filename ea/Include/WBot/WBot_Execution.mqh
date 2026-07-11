//+------------------------------------------------------------------+
//| WBot_Execution.mqh                                               |
//| Order execution for buy/sell legs (logic preserved verbatim)     |
//| Web Connector emit points are additive notification hooks.       |
//+------------------------------------------------------------------+
#ifndef __WBOT_EXECUTION_MQH__
#define __WBOT_EXECUTION_MQH__

#include <Trade\Trade.mqh>
#include "WBot_Logger.mqh"
#include "WBot_Indicators.mqh"
#include "WBot_Risk.mqh"
#include "WBot_DcaGrid.mqh"
#include "WBot_Telegram.mqh"
#include "WBot_WebConnector.mqh"

//====================================================================
//  EXECUTION MODULE
//====================================================================
class CWBotExecution
  {
private:
   CTrade  m_trade;
   string  m_symbol;
   ulong   m_magic;
   int     m_maxOpenTrades;
   int     m_maxSpreadPoints;

   //--- guard helpers (identical semantics to original) -------------
   bool               CanOpenNow(void) const
     {
      return (CountOpenTrades() < m_maxOpenTrades && IsSpreadOK());
     }

   int                CountOpenTrades(void) const
     {
      int c = 0;
      for(int i = 0; i < PositionsTotal(); i++)
        {
         ulong t = PositionGetTicket(i);
         if(PositionSelectByTicket(t) &&
            PositionGetString(POSITION_SYMBOL) == m_symbol &&
            PositionGetInteger(POSITION_MAGIC) == m_magic)
            c++;
        }
      return c;
     }

   bool               IsSpreadOK(void) const
     {
      return (WIndicators.CurrentSpread() <= m_maxSpreadPoints);
     }

   string             TimeStr(void) const
     {
      return TimeToString(TimeCurrent(), TIME_DATE|TIME_MINUTES|TIME_SECONDS);
     }

public:
   //--- constructor
                      CWBotExecution(void) :
        m_symbol(""),
        m_magic(0),
        m_maxOpenTrades(8),
        m_maxSpreadPoints(25)
      {
      }

   //--- lifecycle -----------------------------------------------------
   void               Init(const string symbol,
                           const ulong  magic,
                           const int    maxOpenTrades,
                           const int    maxSpreadPoints)
     {
      m_symbol         = symbol;
      m_magic          = magic;
      m_maxOpenTrades  = maxOpenTrades;
      m_maxSpreadPoints = maxSpreadPoints;

      m_trade.SetExpertMagicNumber(magic);
      m_trade.SetDeviationInPoints(10);
     }

   int                CountTrades(void) const { return CountOpenTrades(); }

   //=================================================================
   //  ExecuteBuy (identical logic to original; +telemetry hooks)
   //=================================================================
   void               ExecuteBuy(const int zoneIndex)
     {
      if(!CanOpenNow())
         return;

      double ask = SymbolInfoDouble(m_symbol, SYMBOL_ASK);
      double atr = WIndicators.GetATR();
      if(atr <= 0)
         return;

      //--- structure SL (swing low - buffer) --------------------------
      double structSL = NormalizeDouble(
         WIndicators.FindSwingLow(InpStructure_Lookback) -
         (atr * InpStructure_Buffer_ATR), _Digits);
      if(ask - structSL < 10 * _Point)
         structSL = NormalizeDouble(ask - 10 * _Point, _Digits);

      double slPoints = (ask - structSL) / _Point;

      //--- TP: structure target, fallback to RR target ----------------
      double structTP = NormalizeDouble(
         WIndicators.FindSwingHigh(InpStructure_Lookback) +
         (atr * InpStructure_Buffer_ATR), _Digits);
      double rrTP = NormalizeDouble(
         ask + slPoints * InpRiskRewardRatio * _Point, _Digits);

      double tp = structTP;
      double structProfitPts = (tp - ask) / _Point;
      if(structProfitPts < slPoints * 0.5 ||
         structProfitPts > slPoints * InpRiskRewardRatio * 1.5)
         tp = rrTP;

      //--- lot sizing -------------------------------------------------
      double lot = WRisk.LotSize(slPoints, InpBaseRiskPercent);

      if(zoneIndex > 0 && InpDCA_LotMultiplier > 1.0)
        {
         double mult = MathMin(MathPow(InpDCA_LotMultiplier, (double)zoneIndex),
                               InpDCA_MaxLotMult);
         double lotStep = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_STEP);
         lot = MathMin(lot * mult, SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_MAX));
         lot = NormalizeDouble(MathFloor(lot / lotStep) * lotStep, 2);
        }

      //--- send order (original semantics) ---------------------------
      if(m_trade.Buy(lot, m_symbol, ask, structSL, tp, "W_Bot_Buy"))
        {
         WGrid.SetBuyTriggered(zoneIndex);

         // NOTE: trade_open is emitted centrally from OnTradeTransaction()
         // (triggered by the entry deal) so the Web Connector stays in sync
         // even for trades opened outside this module.
         WLog.Info(StringFormat("BUY z%d lot=%.2f sl=%.5f tp=%.5f (%d/%d)",
                                zoneIndex, lot, structSL, tp,
                                CountTrades(), m_maxOpenTrades));

         WTelegram.Send("📈 Buy Executed\n📦 Volume: " + DoubleToString(lot, 2) +
                        "\n📌 Active: " + IntegerToString(CountTrades()) + "/" +
                        IntegerToString(m_maxOpenTrades) + "\n🕐 " + TimeStr());
        }
      else
        {
         WLog.Error(StringFormat("BUY failed: ret=%u (%s)",
                                 m_trade.ResultRetcode(),
                                 m_trade.ResultRetcodeDescription()));
        }
     }

   //=================================================================
   //  ExecuteSell (identical logic to original; +telemetry hooks)
   //=================================================================
   void               ExecuteSell(const int zoneIndex)
     {
      if(!CanOpenNow())
         return;

      double bid = SymbolInfoDouble(m_symbol, SYMBOL_BID);
      double atr = WIndicators.GetATR();
      if(atr <= 0)
         return;

      //--- structure SL (swing high + buffer) -------------------------
      double structSL = NormalizeDouble(
         WIndicators.FindSwingHigh(InpStructure_Lookback) +
         (atr * InpStructure_Buffer_ATR), _Digits);
      if(structSL - bid < 10 * _Point)
         structSL = NormalizeDouble(bid + 10 * _Point, _Digits);

      double slPoints = (structSL - bid) / _Point;

      //--- TP ---------------------------------------------------------
      double structTP = NormalizeDouble(
         WIndicators.FindSwingLow(InpStructure_Lookback) -
         (atr * InpStructure_Buffer_ATR), _Digits);
      double rrTP = NormalizeDouble(
         bid - slPoints * InpRiskRewardRatio * _Point, _Digits);

      double tp = structTP;
      double structProfitPts = (bid - tp) / _Point;
      if(structProfitPts < slPoints * 0.5 ||
         structProfitPts > slPoints * InpRiskRewardRatio * 1.5)
         tp = rrTP;

      //--- lot sizing -------------------------------------------------
      double lot = WRisk.LotSize(slPoints, InpBaseRiskPercent);

      if(zoneIndex > 0 && InpDCA_LotMultiplier > 1.0)
        {
         double mult = MathMin(MathPow(InpDCA_LotMultiplier, (double)zoneIndex),
                               InpDCA_MaxLotMult);
         double lotStep = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_STEP);
         lot = MathMin(lot * mult, SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_MAX));
         lot = NormalizeDouble(MathFloor(lot / lotStep) * lotStep, 2);
        }

      //--- send order -------------------------------------------------
      if(m_trade.Sell(lot, m_symbol, bid, structSL, tp, "W_Bot_Sell"))
        {
         WGrid.SetSellTriggered(zoneIndex);

         // NOTE: trade_open is emitted centrally from OnTradeTransaction().
         WLog.Info(StringFormat("SELL z%d lot=%.2f sl=%.5f tp=%.5f (%d/%d)",
                                zoneIndex, lot, structSL, tp,
                                CountTrades(), m_maxOpenTrades));

         WTelegram.Send("📉 Sell Executed\n📦 Volume: " + DoubleToString(lot, 2) +
                        "\n📌 Active: " + IntegerToString(CountTrades()) + "/" +
                        IntegerToString(m_maxOpenTrades) + "\n🕐 " + TimeStr());
        }
      else
        {
         WLog.Error(StringFormat("SELL failed: ret=%u (%s)",
                                 m_trade.ResultRetcode(),
                                 m_trade.ResultRetcodeDescription()));
        }
     }
  };

//--- global singleton
CWBotExecution WExec;

#endif // __WBOT_EXECUTION_MQH__
