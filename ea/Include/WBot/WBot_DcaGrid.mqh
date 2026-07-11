//+------------------------------------------------------------------+
//| WBot_DcaGrid.mqh                                                 |
//| Dynamic DCA grid state machine (logic preserved verbatim)        |
//+------------------------------------------------------------------+
#ifndef __WBOT_DCAGRID_MQH__
#define __WBOT_DCAGRID_MQH__

#include "WBot_Logger.mqh"
#include "WBot_Indicators.mqh"
#include "WBot_Signals.mqh"

//====================================================================
//  DCA GRID MODULE
//====================================================================
class CWBotDcaGrid
  {
private:
   string   m_symbol;
   double   m_buyZones[];     // DCA buy levels (below base)
   double   m_sellZones[];    // DCA sell levels (above base)
   bool     m_buyTriggered[]; // already-executed buy flags
   bool     m_sellTriggered[];// already-executed sell flags
   int      m_activeDirection;// 0=scan, +1=long, -1=short
   double   m_basePrice;      // anchor for grid
   int      m_maxDCA_Levels;

public:
   //--- constructor
                      CWBotDcaGrid(void) :
        m_symbol(""),
        m_activeDirection(0),
        m_basePrice(0),
        m_maxDCA_Levels(6)
      {
      }

   void               Init(const string symbol, const int maxLevels)
     {
      m_symbol        = symbol;
      m_maxDCA_Levels = maxLevels;
     }

   //--- accessors -----------------------------------------------------
   int                Direction(void) const { return m_activeDirection; }
   double             BasePrice(void) const { return m_basePrice; }

   bool               BuyTriggered(const int i)  const { return m_buyTriggered[i];  }
   bool               SellTriggered(const int i) const { return m_sellTriggered[i]; }

   void               SetBuyTriggered(const int i)  { m_buyTriggered[i]  = true; }
   void               SetSellTriggered(const int i) { m_sellTriggered[i] = true; }

   double             BuyZone(const int i)  const { return m_buyZones[i];  }
   double             SellZone(const int i) const { return m_sellZones[i]; }

   int                MaxLevels(void) const { return m_maxDCA_Levels; }

   //=================================================================
   //  InitializeZones (identical to original)
   //   step = ATR * DCA_BaseStep_ATR_Mult * VolatilityMultiplier
   //   zones placed from basePrice downward (buy) / upward (sell)
   //=================================================================
   void               InitializeZones(const int    direction,
                                      const double customBase,
                                      const double dcaStepAtrMult)
     {
      m_activeDirection = direction;
      m_basePrice = (customBase > 0) ? customBase :
                    SymbolInfoDouble(m_symbol, SYMBOL_BID);

      double step = (WIndicators.GetATR() * dcaStepAtrMult *
                     WSignals.GetVolatilityMultiplier(InpUseDynamicVola,
                                                      InpVola_Expand_Mult,
                                                      InpVola_Shrink_Mult)) / _Point;
      if(step < 10)
         step = 10;

      ArrayResize(m_buyZones, m_maxDCA_Levels);
      ArrayResize(m_sellZones, m_maxDCA_Levels);
      ArrayResize(m_buyTriggered, m_maxDCA_Levels);
      ArrayResize(m_sellTriggered, m_maxDCA_Levels);

      for(int i = 0; i < m_maxDCA_Levels; i++)
        {
         m_buyZones[i]  = NormalizeDouble(m_basePrice - (i * step * _Point), _Digits);
         m_buyTriggered[i]  = false;
         m_sellZones[i] = NormalizeDouble(m_basePrice + (i * step * _Point), _Digits);
         m_sellTriggered[i] = false;
        }

      WLog.Debug(StringFormat("Grid: initialised dir=%d base=%.5f step=%d pts",
                              direction, m_basePrice, (int)step));
     }

   //=================================================================
   //  ResetZones (identical)
   //=================================================================
   void               ResetZones(void)
     {
      m_activeDirection = 0;
      m_basePrice = 0;
      ArrayFree(m_buyZones);
      ArrayFree(m_sellZones);
      ArrayFree(m_buyTriggered);
      ArrayFree(m_sellTriggered);
     }
  };

//--- global singleton
CWBotDcaGrid WGrid;

#endif // __WBOT_DCAGRID_MQH__
