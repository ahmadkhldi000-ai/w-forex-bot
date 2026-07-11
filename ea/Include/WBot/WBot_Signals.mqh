//+------------------------------------------------------------------+
//| WBot_Signals.mqh                                                 |
//| Quantum engines: VWAP, volatility multiplier, imbalance candles  |
//| (Signal logic preserved verbatim from v9.3)                      |
//+------------------------------------------------------------------+
#ifndef __WBOT_SIGNALS_MQH__
#define __WBOT_SIGNALS_MQH__

#include "WBot_Logger.mqh"
#include "WBot_Indicators.mqh"

//====================================================================
//  SIGNALS MODULE
//====================================================================
class CWBotSignals
  {
private:
   string   m_symbol;
   double   m_currentVWAP;        // cached intra-day VWAP
   datetime m_lastVWAPCalcDay;    // day of last VWAP computation

   //--- start-of-day timestamp (local server time)
   datetime           TodayStart(void)
     {
      MqlDateTime dtNow;
      TimeCurrent(dtNow);
      return StringToTime(IntegerToString(dtNow.year) + "." +
                          IntegerToString(dtNow.mon)  + "." +
                          IntegerToString(dtNow.day));
     }

public:
   //--- constructor
                      CWBotSignals(void) :
        m_symbol(""),
        m_currentVWAP(0),
        m_lastVWAPCalcDay(0)
      {
      }

   void               Init(const string symbol)
     {
      m_symbol = symbol;
     }

   //=================================================================
   //  QUANTUM ENGINE 1: INTRA-DAY VWAP (preserved)
   //=================================================================
   double             GetVWAP(const bool useVWAPFilter)
     {
      if(!useVWAPFilter)
         return 0;

      datetime todayStart = TodayStart();
      if(m_lastVWAPCalcDay == todayStart && m_currentVWAP > 0)
         return m_currentVWAP;

      double cumTPV = 0;
      double cumVol = 0;
      int    barsDay = Bars(m_symbol, PERIOD_CURRENT, todayStart, TimeCurrent());

      if(barsDay <= 0 || barsDay > 2000)
         return 0;

      long vol[];
      ArraySetAsSeries(vol, true);
      if(CopyTickVolume(m_symbol, PERIOD_CURRENT, 0, barsDay, vol) <= 0)
        {
         WLog.Warn("Signals: CopyTickVolume failed");
         return 0;
        }

      for(int i = 0; i < barsDay; i++)
        {
         double typical = (iHigh(m_symbol, PERIOD_CURRENT, i) +
                           iLow(m_symbol, PERIOD_CURRENT, i)  +
                           iClose(m_symbol, PERIOD_CURRENT, i)) / 3.0;
         cumTPV += typical * (double)vol[i];
         cumVol += (double)vol[i];
        }

      if(cumVol > 0)
        {
         m_currentVWAP   = cumTPV / cumVol;
         m_lastVWAPCalcDay = todayStart;
        }
      return m_currentVWAP;
     }

   //=================================================================
   //  QUANTUM ENGINE 2: VOLATILITY MULTIPLIER (preserved)
   //=================================================================
   double             GetVolatilityMultiplier(const bool   useDynamicVola,
                                              const double expandMult,
                                              const double shrinkMult) const
     {
      if(!useDynamicVola)
         return 1.0;

      double atrFast = WIndicators.GetATR(1);
      double atrSlow = WIndicators.GetATR(14);
      if(atrSlow == 0)
         return 1.0;

      double ratio = atrFast / atrSlow;
      if(ratio > 1.5) return expandMult;
      if(ratio < 0.7) return shrinkMult;
      return 1.0;
     }

   //=================================================================
   //  QUANTUM ENGINE 3: TICK LIQUIDITY IMBALANCE (preserved)
   //=================================================================
   bool               IsBuyImbalance(const bool useTickImbalance,
                                     const double threshold,
                                     const int shift = 1) const
     {
      if(!useTickImbalance)
         return true;

      double open1  = iOpen(m_symbol, PERIOD_CURRENT, shift);
      double close1 = iClose(m_symbol, PERIOD_CURRENT, shift);
      double high1  = iHigh(m_symbol, PERIOD_CURRENT, shift);
      double low1   = iLow(m_symbol, PERIOD_CURRENT, shift);

      double body = MathAbs(close1 - open1);
      if(body == 0)
         return false;

      double lowerWick = MathMin(open1, close1) - low1;
      double upperWick = high1 - MathMax(open1, close1);
      return (close1 > open1 &&
              lowerWick > body * threshold &&
              upperWick < body * 0.3);
     }

   bool               IsSellImbalance(const bool useTickImbalance,
                                      const double threshold,
                                      const int shift = 1) const
     {
      if(!useTickImbalance)
         return true;

      double open1  = iOpen(m_symbol, PERIOD_CURRENT, shift);
      double close1 = iClose(m_symbol, PERIOD_CURRENT, shift);
      double high1  = iHigh(m_symbol, PERIOD_CURRENT, shift);
      double low1   = iLow(m_symbol, PERIOD_CURRENT, shift);

      double body = MathAbs(close1 - open1);
      if(body == 0)
         return false;

      double upperWick = high1 - MathMax(open1, close1);
      double lowerWick = MathMin(open1, close1) - low1;
      return (close1 < open1 &&
              upperWick > body * threshold &&
              lowerWick < body * 0.3);
     }
  };

//--- global singleton
CWBotSignals WSignals;

#endif // __WBOT_SIGNALS_MQH__
