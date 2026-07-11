//+------------------------------------------------------------------+
//| WBot_Risk.mqh                                                    |
//| Position sizing (logic preserved verbatim from v9.3)             |
//+------------------------------------------------------------------+
#ifndef __WBOT_RISK_MQH__
#define __WBOT_RISK_MQH__

#include "WBot_Logger.mqh"

//====================================================================
//  RISK MODULE
//====================================================================
class CWBotRisk
  {
private:
   string   m_symbol;

public:
   //--- constructor
                      CWBotRisk(void) : m_symbol("") {}

   void               Init(const string symbol) { m_symbol = symbol; }

   //=================================================================
   //  LotSize (identical to original)
   //   risk = balance * BaseRiskPercent / 100
   //   slTicks = (slPoints * Point) / tickSize
   //   lot = risk / (slTicks * tickValue)
   //=================================================================
   double             LotSize(const double slPoints,
                              const double baseRiskPercent) const
     {
      if(slPoints <= 0)
         return 0.01;

      double tickValue = SymbolInfoDouble(m_symbol, SYMBOL_TRADE_TICK_VALUE);
      double tickSize  = SymbolInfoDouble(m_symbol, SYMBOL_TRADE_TICK_SIZE);
      if(tickValue <= 0 || tickSize <= 0)
         return 0.01;

      double slTicks = (slPoints * _Point) / tickSize;
      double lot = (AccountInfoDouble(ACCOUNT_BALANCE) * baseRiskPercent / 100.0) /
                   (slTicks * tickValue);

      double minLot  = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_MIN);
      double maxLot  = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_MAX);
      double lotStep = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_STEP);
      if(lotStep <= 0)
         lotStep = 0.01;

      lot = MathMax(minLot, MathMin(maxLot, lot));
      return NormalizeDouble(MathFloor(lot / lotStep) * lotStep, 2);
     }
  };

//--- global singleton
CWBotRisk WRisk;

#endif // __WBOT_RISK_MQH__
