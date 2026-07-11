//+------------------------------------------------------------------+
//| WBot_Logger.mqh                                                  |
//| Leveled, timestamped logging for the W Forex Bot                 |
//| Levels: DEBUG < INFO < WARN < ERROR                              |
//+------------------------------------------------------------------+
#ifndef __WBOT_LOGGER_MQH__
#define __WBOT_LOGGER_MQH__

//====================================================================
//  ENUM & CONFIG
//====================================================================
enum ENUM_WBOT_LOG_LEVEL
  {
   WBOT_LOG_DEBUG = 0,  // verbose diagnostics
   WBOT_LOG_INFO  = 1,  // normal operation
   WBOT_LOG_WARN  = 2,  // non-fatal anomalies
   WBOT_LOG_ERROR = 3   // failures
  };

//====================================================================
//  LOGGER MODULE
//====================================================================
class CWBotLogger
  {
private:
   ENUM_WBOT_LOG_LEVEL m_minLevel;
   bool                m_toExperts;   // Print() -> Experts tab
   bool                m_toJournal;   // Print() goes to journal too

   //--- translate level -> readable tag
   string             LevelTag(ENUM_WBOT_LOG_LEVEL lvl)
     {
      switch(lvl)
        {
         case WBOT_LOG_DEBUG: return "DEBUG";
         case WBOT_LOG_INFO:  return "INFO ";
         case WBOT_LOG_WARN:  return "WARN ";
         case WBOT_LOG_ERROR: return "ERROR";
        }
      return "?????";
     }

   //--- ISO-ish timestamp from TimeCurrent
   string             NowStr()
     {
      return TimeToString(TimeCurrent(), TIME_DATE|TIME_MINUTES|TIME_SECONDS);
     }

public:
   //--- constructor
                      CWBotLogger(void) :
        m_minLevel(WBOT_LOG_INFO),
        m_toExperts(true),
        m_toJournal(false)
      {
      }

   //--- configuration -------------------------------------------------
   void               SetMinLevel(ENUM_WBOT_LOG_LEVEL lvl) { m_minLevel = lvl; }
   void               EnableExperts(bool on)               { m_toExperts = on; }
   void               EnableJournal(bool on)               { m_toJournal = on; }

   ENUM_WBOT_LOG_LEVEL GetMinLevel(void) const             { return m_minLevel; }

   //--- core emit -----------------------------------------------------
   void               Log(ENUM_WBOT_LOG_LEVEL lvl, string message)
     {
      if(lvl < m_minLevel)
         return;

      string line = StringFormat("[%s] [%s] %s", LevelTag(lvl), NowStr(), message);

      // Print() always goes to the Experts tab; ideal for diagnostics
      if(m_toExperts)
         Print(line);

      // Optional secondary sink
      if(m_toJournal)
         Print(line);
     }

   //--- convenience wrappers
   void               Debug(string m) { Log(WBOT_LOG_DEBUG, m); }
   void               Info(string m)  { Log(WBOT_LOG_INFO,  m); }
   void               Warn(string m)  { Log(WBOT_LOG_WARN,  m); }
   void               Error(string m) { Log(WBOT_LOG_ERROR, m); }
  };

//--- global singleton
CWBotLogger WLog;

#endif // __WBOT_LOGGER_MQH__
