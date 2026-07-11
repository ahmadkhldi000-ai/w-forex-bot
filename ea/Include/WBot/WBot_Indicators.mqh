//+------------------------------------------------------------------+
//| WBot_Indicators.mqh                                              |
//| ATR handle + swing-structure helpers (logic preserved)           |
//+------------------------------------------------------------------+
#ifndef __WBOT_INDICATORS_MQH__
#define __WBOT_INDICATORS_MQH__

#include "WBot_Logger.mqh"

//====================================================================
//  INDICATORS / STRUCTURE MODULE
//====================================================================
class CWBotIndicators
  {
private:
   int      m_atrHandle;       // ATR(14) handle
   string   m_symbol;
   int      m_digits;

public:
   //--- constructor
                      CWBotIndicators(void) :
        m_atrHandle(INVALID_HANDLE),
        m_symbol(""),
        m_digits(0)
      {
      }

   //--- lifecycle -----------------------------------------------------
   bool               Init(const string symbol)
     {
      m_symbol = symbol;
      m_digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);

      m_atrHandle = iATR(symbol, PERIOD_CURRENT, 14);
      if(m_atrHandle == INVALID_HANDLE)
        {
         WLog.Error(StringFormat("Indicators: iATR init failed for %s (err=%d)",
                                 symbol, GetLastError()));
         return false;
        }
      WLog.Debug("Indicators: ATR(14) initialized");
      return true;
     }

   void               Deinit(void)
     {
      if(m_atrHandle != INVALID_HANDLE)
        {
         IndicatorRelease(m_atrHandle);
         m_atrHandle = INVALID_HANDLE;
        }
     }

   //--- ATR value at shift -------------------------------------------
   //   (kept identical to original GetATR)
   double             GetATR(const int shift = 1) const
     {
      double val[1];
      if(m_atrHandle != INVALID_HANDLE && CopyBuffer(m_atrHandle, 0, shift, 1, val) > 0)
         return val[0];
      return 0.0;
     }

   //--- swing low / high (identical to original) ---------------------
   double             FindSwingLow(const int lookback = 60) const
     {
      double minLow = DBL_MAX;
      for(int i = 1; i <= lookback; i++)
        {
         double low = iLow(m_symbol, PERIOD_CURRENT, i);
         if(low < minLow)
            minLow = low;
        }
      return minLow;
     }

   double             FindSwingHigh(const int lookback = 60) const
     {
      double maxHigh = 0;
      for(int i = 1; i <= lookback; i++)
        {
         double high = iHigh(m_symbol, PERIOD_CURRENT, i);
         if(high > maxHigh)
            maxHigh = high;
        }
      return maxHigh;
     }

   //--- spread helper (preserved) ------------------------------------
   double             CurrentSpread(void) const
     {
      return (SymbolInfoDouble(m_symbol, SYMBOL_ASK) -
              SymbolInfoDouble(m_symbol, SYMBOL_BID)) / _Point;
     }

   int                Digits(void) const { return m_digits; }
   string             Symbol(void) const { return m_symbol; }
  };

//--- global singleton
CWBotIndicators WIndicators;

#endif // __WBOT_INDICATORS_MQH__
