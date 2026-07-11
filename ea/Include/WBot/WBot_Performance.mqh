//+------------------------------------------------------------------+
//| WBot_Performance.mqh                                             |
//| Internal performance monitor — purely additive telemetry         |
//| (does NOT alter entry/exit/risk logic)                           |
//+------------------------------------------------------------------+
#ifndef __WBOT_PERFORMANCE_MQH__
#define __WBOT_PERFORMANCE_MQH__

#include "WBot_Logger.mqh"

//====================================================================
//  PERFORMANCE MONITOR MODULE
//====================================================================
class CWBotPerformance
  {
private:
   string   m_symbol;

   //--- counters / accumulators
   int      m_totalTrades;
   int      m_wins;
   int      m_losses;
   double   m_totalProfit;       // net PnL across closed trades
   double   m_largestWin;
   double   m_largestLoss;

   //--- equity curve
   double   m_startEquity;
   double   m_peakEquity;
   double   m_maxDrawdownAbs;
   double   m_maxDrawdownPct;

   //--- execution latency (ms)
   double   m_signalMsAvg;
   int      m_signalSamples;

   //--- cooldown / state
   datetime m_lastReportTime;
   int      m_reportIntervalSec;

   //--- helpers -------------------------------------------------------
   double   CurrentEquity(void) const
     {
      return AccountInfoDouble(ACCOUNT_EQUITY);
     }

   void     UpdateDrawdown(void)
     {
      double eq = CurrentEquity();
      if(eq > m_peakEquity)
         m_peakEquity = eq;

      double dd = m_peakEquity - eq;
      if(dd > m_maxDrawdownAbs)
        {
         m_maxDrawdownAbs = dd;
         if(m_peakEquity > 0)
            m_maxDrawdownPct = (dd / m_peakEquity) * 100.0;
        }
     }

public:
   //--- constructor
                      CWBotPerformance(void) :
        m_symbol(""),
        m_totalTrades(0),
        m_wins(0),
        m_losses(0),
        m_totalProfit(0),
        m_largestWin(0),
        m_largestLoss(0),
        m_startEquity(0),
        m_peakEquity(0),
        m_maxDrawdownAbs(0),
        m_maxDrawdownPct(0),
        m_signalMsAvg(0),
        m_signalSamples(0),
        m_lastReportTime(0),
        m_reportIntervalSec(30)
      {
      }

   //--- lifecycle -----------------------------------------------------
   void               Init(const string symbol, const int intervalSec)
     {
      m_symbol = symbol;
      m_startEquity = CurrentEquity();
      m_peakEquity  = m_startEquity;
      m_reportIntervalSec = (intervalSec > 0) ? intervalSec : 30;
      m_lastReportTime = TimeCurrent();
     }

   //--- recorders -----------------------------------------------------
   void               RecordTradeClose(const double profit)
     {
      m_totalTrades++;
      m_totalProfit += profit;

      if(profit >= 0)
        {
         m_wins++;
         if(profit > m_largestWin) m_largestWin = profit;
        }
      else
        {
         m_losses++;
         if(profit < m_largestLoss) m_largestLoss = profit;
        }

      UpdateDrawdown();
     }

   //--- record signal/execution latency (tick processing time) -------
   void               RecordTickMs(const uint elapsedMs)
     {
      m_signalSamples++;
      // running average
      m_signalMsAvg = m_signalMsAvg + ((double)elapsedMs - m_signalMsAvg) / m_signalSamples;
     }

   //--- getters -------------------------------------------------------
   int      TotalTrades(void)   const { return m_totalTrades; }
   int      Wins(void)          const { return m_wins; }
   int      Losses(void)        const { return m_losses; }
   double   TotalProfit(void)   const { return m_totalProfit; }
   double   WinRate(void)       const { return (m_totalTrades > 0)
                                             ? (double)m_wins / m_totalTrades * 100.0 : 0.0; }
   double   PeakEquity(void)    const { return m_peakEquity; }
   double   MaxDrawdownPct(void) const { return m_maxDrawdownPct; }
   double   StartEquity(void)   const { return m_startEquity; }

   //--- current (live) drawdown from peak, by reference ------------
   //   Used by the Web Connector's account snapshot. Computes the
   //   instantaneous drawdown (peak - equity) without mutating the
   //   running-max history.
   void     CalcDrawdown(double &absOut, double &pctOut) const
     {
      double eq = CurrentEquity();
      double peak = (m_peakEquity > eq) ? m_peakEquity : eq;
      absOut = (peak > eq) ? (peak - eq) : 0.0;
      pctOut = (peak > 0) ? (absOut / peak) * 100.0 : 0.0;
     }
   double   NetReturnPct(void)  const { return (m_startEquity > 0)
                                             ? (CurrentEquity() - m_startEquity) / m_startEquity * 100.0 : 0.0; }
   double   AvgTickMs(void)     const { return m_signalMsAvg; }

   //--- periodic report ----------------------------------------------
   //   Called from OnTick; emits a log line + Comment-dash line on cadence
   bool               MaybeReport(const bool force = false)
     {
      UpdateDrawdown();

      datetime now = TimeCurrent();
      if(!force && (now - m_lastReportTime) < m_reportIntervalSec)
         return false;

      m_lastReportTime = now;

      string line = StringFormat(
         "Monitor | trades=%d W/L=%d/%d (%.1f%%) PnL=$%.2f ret=%.2f%% DD=%.2f%% peak=$%.2f avgTick=%.1fms",
         m_totalTrades, m_wins, m_losses, WinRate(), m_totalProfit,
         NetReturnPct(), m_maxDrawdownPct, m_peakEquity, m_signalMsAvg);

      WLog.Info(line);
      return true;
      // Note: return value lets caller decide whether to push to WebConnector
     }
  };

//--- global singleton
CWBotPerformance WPerf;

#endif // __WBOT_PERFORMANCE_MQH__
