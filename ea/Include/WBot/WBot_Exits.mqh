//+------------------------------------------------------------------+
//| WBot_Exits.mqh                                                   |
//| Exit management: 3-tier smart scale-out + ATR trailing           |
//| (Logic preserved verbatim from v9.3; suppressCloseNotify flag    |
//|  exposed so OnTradeTransaction can suppress notifications.)      |
//+------------------------------------------------------------------+
#ifndef __WBOT_EXITS_MQH__
#define __WBOT_EXITS_MQH__

#include <Trade\Trade.mqh>
#include "WBot_Logger.mqh"
#include "WBot_Indicators.mqh"
#include "WBot_Telegram.mqh"

//====================================================================
//  EXITS MODULE
//====================================================================
class CWBotExits
  {
private:
   CTrade  m_trade;
   string  m_symbol;
   ulong   m_magic;
   bool    m_suppressCloseNotify;   // mirrored global from original

   string             TimeStr(void) const
     {
      return TimeToString(TimeCurrent(), TIME_DATE|TIME_MINUTES|TIME_SECONDS);
     }

public:
   //--- constructor
                      CWBotExits(void) :
        m_symbol(""),
        m_magic(0),
        m_suppressCloseNotify(false)
      {
      }

   //--- lifecycle -----------------------------------------------------
   void               Init(const string symbol, const ulong magic)
     {
      m_symbol = symbol;
      m_magic  = magic;
      m_trade.SetExpertMagicNumber(magic);
      m_trade.SetDeviationInPoints(10);
     }

   //--- the OnTradeTransaction hook checks this ----------------------
   bool               SuppressCloseNotify(void) const { return m_suppressCloseNotify; }

   //=================================================================
   //  ManageSmartScaleOut (3-tier exit, preserved verbatim)
   //=================================================================
   void               ManageSmartScaleOut(void)
     {
      if(!InpEnableSmartScaleOut)
         return;

      for(int i = PositionsTotal() - 1; i >= 0; i--)
        {
         ulong ticket = PositionGetTicket(i);
         if(!PositionSelectByTicket(ticket) ||
            PositionGetString(POSITION_SYMBOL) != m_symbol ||
            PositionGetInteger(POSITION_MAGIC) != m_magic)
            continue;

         ENUM_POSITION_TYPE type = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
         double openPrice  = PositionGetDouble(POSITION_PRICE_OPEN);
         double currentSL  = PositionGetDouble(POSITION_SL);
         double currentTP  = PositionGetDouble(POSITION_TP);
         double volume     = PositionGetDouble(POSITION_VOLUME);

         double slPoints = MathAbs(openPrice - currentSL) / _Point;
         if(slPoints <= 0)
            continue;

         double currentPrice = (type == POSITION_TYPE_BUY)
            ? SymbolInfoDouble(m_symbol, SYMBOL_BID)
            : SymbolInfoDouble(m_symbol, SYMBOL_ASK);
         double profitPoints = (type == POSITION_TYPE_BUY)
            ? (currentPrice - openPrice) / _Point
            : (openPrice - currentPrice) / _Point;

         double minLot = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_MIN);
         double ls     = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_STEP);

         //=== TIER 1: close 1/3, move SL to breakeven =================
         if(profitPoints >= slPoints * InpTier1_TP_Mult &&
            MathAbs(currentTP - openPrice) > slPoints * (InpTier1_TP_Mult + 0.1) * _Point)
           {
            double closeLot = NormalizeDouble(
               MathFloor((volume * InpTier1_ClosePct / 100.0) / ls) * ls, 2);
            if(closeLot >= minLot && closeLot < volume)
              {
               m_suppressCloseNotify = true;
               if(m_trade.PositionClosePartial(ticket, closeLot))
                 {
                  m_trade.PositionModify(ticket, NormalizeDouble(openPrice, _Digits), currentTP);
                  WLog.Info(StringFormat("Tier1 ticket=%I64u closed=%.2f SL->BE",
                                         ticket, closeLot));
                  WTelegram.Send("🎯 Stage 1 Secured\n✂️ Closed: 1/3\n🛡️ SL → Breakeven\n🕐 " + TimeStr());
                 }
               m_suppressCloseNotify = false;
               break;
              }
           }
         //=== TIER 2: close half of rest, lock SL at +1R ==============
         else if(profitPoints >= slPoints * InpTier2_TP_Mult &&
                 MathAbs(currentTP - openPrice) > slPoints * (InpTier2_TP_Mult + 0.1) * _Point)
           {
            double closeLot = NormalizeDouble(
               MathFloor((volume * InpTier2_ClosePct / 100.0) / ls) * ls, 2);
            if(closeLot >= minLot && closeLot < volume)
              {
               m_suppressCloseNotify = true;
               if(m_trade.PositionClosePartial(ticket, closeLot))
                 {
                  double newSL = (type == POSITION_TYPE_BUY)
                     ? NormalizeDouble(openPrice + slPoints * InpTier1_TP_Mult * _Point, _Digits)
                     : NormalizeDouble(openPrice - slPoints * InpTier1_TP_Mult * _Digits, _Digits);
                  m_trade.PositionModify(ticket, newSL, currentTP);
                  WLog.Info(StringFormat("Tier2 ticket=%I64u closed=%.2f SL locked +1R",
                                         ticket, closeLot));
                  WTelegram.Send("🏆 Stage 2 Secured\n✂️ Closed: 1/3\n🔒 Profits Locked\n🕐 " + TimeStr());
                 }
               m_suppressCloseNotify = false;
               break;
              }
           }
        }
     }

   //=================================================================
   //  ManageATRTrailing (final 1/3, preserved verbatim)
   //=================================================================
   void               ManageATRTrailing(void)
     {
      if(!InpUseATRTrailing)
         return;

      double atr = WIndicators.GetATR(0);
      if(atr <= 0)
         return;
      double trailDist = atr * InpATR_Trailing_Mult;

      for(int i = PositionsTotal() - 1; i >= 0; i--)
        {
         ulong ticket = PositionGetTicket(i);
         if(!PositionSelectByTicket(ticket) ||
            PositionGetString(POSITION_SYMBOL) != m_symbol ||
            PositionGetInteger(POSITION_MAGIC) != m_magic)
            continue;

         ENUM_POSITION_TYPE type = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
         double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
         double currentSL = PositionGetDouble(POSITION_SL);
         double tp        = PositionGetDouble(POSITION_TP);
         double slPoints  = MathAbs(openPrice - currentSL) / _Point;

         // only trail after tier-2 has fired
         if(slPoints > 0)
           {
            double profitPts = (type == POSITION_TYPE_BUY)
               ? (SymbolInfoDouble(m_symbol, SYMBOL_BID) - openPrice) / _Point
               : (openPrice - SymbolInfoDouble(m_symbol, SYMBOL_ASK)) / _Point;
            if(profitPts < slPoints * InpTier2_TP_Mult)
               continue;
           }

         if(type == POSITION_TYPE_BUY)
           {
            double bid   = SymbolInfoDouble(m_symbol, SYMBOL_BID);
            double newSL = NormalizeDouble(bid - trailDist, _Digits);
            if(bid > openPrice && newSL > currentSL + _Point)
               m_trade.PositionModify(ticket, newSL, tp);
           }
         else
           {
            double ask   = SymbolInfoDouble(m_symbol, SYMBOL_ASK);
            double newSL = NormalizeDouble(ask + trailDist, _Digits);
            if(ask < openPrice && (newSL < currentSL - _Point || currentSL == 0))
               m_trade.PositionModify(ticket, newSL, tp);
           }
        }
     }
  };

//--- global singleton
CWBotExits WExits;

#endif // __WBOT_EXITS_MQH__
