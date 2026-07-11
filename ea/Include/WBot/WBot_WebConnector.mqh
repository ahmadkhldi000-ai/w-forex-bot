//+------------------------------------------------------------------+
//| WBot_WebConnector.mqh                                            |
//|                                                                  |
//|   W Forex Bot - Web Connector                                    |
//|   ============================                                   |
//|   Standalone module that streams the bot's live state to an      |
//|   external platform over HTTPS REST (POST), authenticated with   |
//|   an API key (X-API-Key header).                                 |
//|                                                                  |
//|   Data pushed:                                                   |
//|     • account   : number, broker, server, balance, equity,       |
//|                   margin, drawdown                               |
//|     • open trades: ticket, symbol, BUY/SELL, lot, entry,         |
//|                    current, SL, TP, profit, open time            |
//|     • closed trade: entry, exit, profit, duration                |
//|                                                                  |
//|   When:                                                          |
//|     • immediately on trade OPEN / MODIFY / CLOSE                 |
//|       (driven by OnTradeTransaction)                             |
//|     • periodically as a full sync (UPDATE_INTERVAL)              |
//|                                                                  |
//|   Resilience:                                                    |
//|     A failed/absent connection NEVER interrupts the bot. Every   |
//|     network call is wrapped and failures are counted + logged    |
//|     once; the trading engine keeps running.                      |
//|                                                                  |
//|   This module is purely additive - it does NOT alter entry,      |
//|   exit, or risk logic in any way.                                |
//+------------------------------------------------------------------+
#ifndef __WBOT_WEBCONNECTOR_MQH__
#define __WBOT_WEBCONNECTOR_MQH__

#include "WBot_Logger.mqh"
#include "WBot_Performance.mqh"   // WPerf.CalcDrawdown() for account snapshot

//====================================================================
//  EVENT TYPE TAGS
//====================================================================
#define WBOT_EVT_ACCOUNT     "account"
#define WBOT_EVT_TRADE_OPEN  "trade_open"
#define WBOT_EVT_TRADE_MODIFY "trade_modify"
#define WBOT_EVT_TRADE_CLOSE "trade_close"
#define WBOT_EVT_FULL_SYNC   "full_sync"
#define WBOT_EVT_CONNECTION  "connection"

//====================================================================
//  WEB CONNECTOR MODULE
//====================================================================
class CWBotWebConnector
  {
private:
   //--- configuration -----------------------------------------------
   bool     m_enabled;
   string   m_apiUrl;          // API_URL
   string   m_apiKey;          // API_KEY
   int      m_timeoutMs;       // request timeout
   int      m_updateInterval;  // periodic full-sync interval (sec)
   string   m_symbol;
   ulong    m_magic;

   //--- runtime stats -----------------------------------------------
   bool     m_online;          // last request succeeded
   int      m_eventsSent;
   int      m_eventsFailed;
   datetime m_lastSyncTime;    // throttle for periodic full sync
   bool     m_failWarned;      // suppress repeated failure logs

   //--------------------------------------------------------------
   //  low-level helpers
   //--------------------------------------------------------------

   //--- ISO-ish timestamp of current server time
   string             NowIso(void)
     {
      return TimeToString(TimeCurrent(), TIME_DATE|TIME_MINUTES|TIME_SECONDS);
     }

   //--- ISO-ish timestamp from any datetime
   string             Iso(const datetime t)
     {
      if(t <= 0) return "";
      return TimeToString(t, TIME_DATE|TIME_MINUTES|TIME_SECONDS);
     }

   //--- escape a string for safe JSON embedding
   string             JsonEscape(const string s)
     {
      string out = s;
      StringReplace(out, "\\", "\\\\");
      StringReplace(out, "\"", "\\\"");
      StringReplace(out, "\r", " ");
      StringReplace(out, "\n", " ");
      StringReplace(out, "\t", " ");
      return out;
     }

   //--- convert a bool to a JSON literal
   string             JsonBool(const bool b) { return b ? "true" : "false"; }

   //--- safe long/ulong -> string (avoids any format-specifier pitfalls)
   string             L2S(const long   v) { return IntegerToString(v); }
   string             U2S(const ulong  v) { return IntegerToString((long)v); }

   //--------------------------------------------------------------
   //  JSON PAYLOAD BUILDERS
   //--------------------------------------------------------------

   //--- account snapshot -------------------------------------------
   //   account number, broker, server, balance, equity, margin, drawdown
   string             BuildAccountJson(void)
     {
      double balance = AccountInfoDouble(ACCOUNT_BALANCE);
      double equity  = AccountInfoDouble(ACCOUNT_EQUITY);
      double margin  = AccountInfoDouble(ACCOUNT_MARGIN);

      // drawdown = peak-equity based (account-wide)
      double dd = 0.0;
      double ddPct = 0.0;
      WPerf.CalcDrawdown(dd, ddPct);

      string broker = AccountInfoString(ACCOUNT_COMPANY);
      string server = AccountInfoString(ACCOUNT_SERVER);

      string j = "{";
      j += "\"accountNumber\":" + U2S(AccountInfoInteger(ACCOUNT_LOGIN)) + ",";
      j += "\"broker\":\""      + JsonEscape(broker) + "\",";
      j += "\"server\":\""      + JsonEscape(server) + "\",";
      j += "\"balance\":"       + DoubleToString(balance, 2) + ",";
      j += "\"equity\":"        + DoubleToString(equity, 2)  + ",";
      j += "\"margin\":"        + DoubleToString(margin, 2)  + ",";
      j += "\"drawdown\":"      + DoubleToString(dd, 2)      + ",";
      j += "\"drawdownPct\":"   + DoubleToString(ddPct, 2)   + ",";
      j += "\"currency\":\""    + JsonEscape(AccountInfoString(ACCOUNT_CURRENCY)) + "\",";
      j += "\"leverage\":"      + L2S(AccountInfoInteger(ACCOUNT_LEVERAGE))    + ",";
      j += "\"symbol\":\""      + JsonEscape(m_symbol)      + "\",";
      j += "\"time\":\""        + NowIso() + "\"";
      j += "}";
      return j;
     }

   //--- single open position -> JSON object ------------------------
   string             BuildOpenTradeJson(const ulong ticket)
     {
      if(!PositionSelectByTicket(ticket))
         return "";

      ENUM_POSITION_TYPE type = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      string side   = (type == POSITION_TYPE_BUY) ? "BUY" : "SELL";
      string symbol = PositionGetString(POSITION_SYMBOL);
      double vol    = PositionGetDouble(POSITION_VOLUME);
      double entry  = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl     = PositionGetDouble(POSITION_SL);
      double tp     = PositionGetDouble(POSITION_TP);
      double profit = PositionGetDouble(POSITION_PROFIT);
      datetime open = (datetime)PositionGetInteger(POSITION_TIME);

      double current = (type == POSITION_TYPE_BUY)
                       ? SymbolInfoDouble(symbol, SYMBOL_BID)
                       : SymbolInfoDouble(symbol, SYMBOL_ASK);

      string j = "{";
      j += "\"ticket\":"       + U2S(ticket)         + ",";
      j += "\"symbol\":\""     + JsonEscape(symbol)  + "\",";
      j += "\"side\":\""       + side                + "\",";
      j += "\"lot\":"          + DoubleToString(vol, 2)   + ",";
      j += "\"entryPrice\":"   + DoubleToString(entry, 5) + ",";
      j += "\"currentPrice\":" + DoubleToString(current, 5) + ",";
      j += "\"sl\":"           + DoubleToString(sl, 5)    + ",";
      j += "\"tp\":"           + DoubleToString(tp, 5)    + ",";
      j += "\"profit\":"       + DoubleToString(profit, 2)+ ",";
      j += "\"openTime\":\""   + Iso(open)           + "\",";
      j += "\"magic\":"        + U2S((ulong)PositionGetInteger(POSITION_MAGIC));
      j += "}";
      return j;
     }

   //--- all open positions (this symbol + magic) -> JSON array -----
   string             BuildOpenTradesJson(void)
     {
      string arr = "[";
      bool first = true;
      for(int i = 0; i < PositionsTotal(); i++)
        {
         ulong ticket = PositionGetTicket(i);
         if(!PositionSelectByTicket(ticket))
            continue;
         if(PositionGetString(POSITION_SYMBOL) != m_symbol)
            continue;
         if(m_magic != 0 && (ulong)PositionGetInteger(POSITION_MAGIC) != m_magic)
            continue;

         if(!first) arr += ",";
         arr += BuildOpenTradeJson(ticket);
         first = false;
        }
      arr += "]";
      return arr;
     }

   //--- closed trade from a closing deal -> JSON object ------------
   //   entry, exit, profit, duration
   string             BuildClosedTradeJson(const ulong dealTicket)
     {
      if(!HistoryDealSelect(dealTicket))
         return "";

      double profit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
      double exitPx = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
      datetime exitT = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
      string  symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
      long    posId  = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
      ulong   magic  = (ulong)HistoryDealGetInteger(dealTicket, DEAL_MAGIC);

      // resolve the matching IN deal (entry) for this position id
      double  entryPx = 0.0;
      datetime entryT = 0;
      string  side = "";

      if(HistorySelectByPosition(posId))
        {
         int deals = HistoryDealsTotal();
         for(int i = 0; i < deals; i++)
           {
            ulong dt = HistoryDealGetTicket(i);
            if(dt == 0) continue;
            if((long)HistoryDealGetInteger(dt, DEAL_POSITION_ID) != posId)
               continue;
            ENUM_DEAL_ENTRY de = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dt, DEAL_ENTRY);
            if(de == DEAL_ENTRY_IN)
              {
               entryPx = HistoryDealGetDouble(dt, DEAL_PRICE);
               entryT  = (datetime)HistoryDealGetInteger(dt, DEAL_TIME);
               ENUM_DEAL_TYPE dtype = (ENUM_DEAL_TYPE)HistoryDealGetInteger(dt, DEAL_TYPE);
               side = (dtype == DEAL_TYPE_BUY) ? "BUY" : "SELL";
               break;
              }
           }
        }

      // duration in seconds (0 if entry unknown)
      long durationSec = (entryT > 0 && exitT >= entryT) ? (long)(exitT - entryT) : 0;

      string j = "{";
      j += "\"ticket\":"    + U2S(dealTicket)        + ",";
      j += "\"symbol\":\""  + JsonEscape(symbol)     + "\",";
      j += "\"side\":\""    + side                   + ",";
      j += "\"entryPrice\":"+ DoubleToString(entryPx, 5) + ",";
      j += "\"exitPrice\":" + DoubleToString(exitPx, 5)  + ",";
      j += "\"profit\":"    + DoubleToString(profit, 2)  + ",";
      j += "\"entryTime\":\""  + Iso(entryT)         + "\",";
      j += "\"exitTime\":\""   + Iso(exitT)          + "\",";
      j += "\"durationSec\":"  + L2S(durationSec)    + ",";
      j += "\"magic\":"        + U2S(magic);
      j += "}";
      return j;
     }

   //--------------------------------------------------------------
   //  HTTP TRANSPORT
   //--------------------------------------------------------------

   //--- POST a JSON body to the API with X-API-Key authentication -
   //   Returns true on HTTP 200. NEVER throws / never blocks the bot.
   bool               PostJson(const string &jsonPayload, const string &eventType)
     {
      if(!m_enabled || m_apiUrl == "")
         return false;

      uchar post[];
      StringToCharArray(jsonPayload, post, 0, WHOLE_ARRAY, CP_UTF8);

      // headers: JSON content-type + API key
      string hdr = "Content-Type: application/json\r\n";
      if(m_apiKey != "")
         hdr += "X-API-Key: " + m_apiKey + "\r\n";

      uchar  res[];
      string rh;
      ResetLastError();
      int r = WebRequest("POST", m_apiUrl, hdr, m_timeoutMs, post, res, rh);

      if(r == 200)
        {
         if(!m_online)
           {
            WLog.Info("WebConnector: connection restored");
            m_online = true;
           }
         m_eventsSent++;
         m_failWarned = false;
         return true;
        }

      //---- failure path (resilient: just log + count, keep going) ----
      m_online = false;
      m_eventsFailed++;
      if(!m_failWarned)
        {
         if(r == -1)
            WLog.Warn("WebConnector: request failed - whitelist API_URL in Terminal options (the bot keeps running)");
         else
            WLog.Warn(StringFormat("WebConnector: HTTP %d on '%s' (the bot keeps running)", r, eventType));
         m_failWarned = true;
        }
      return false;
     }

   //--- wrap any payload in the standard event envelope ------------
   bool               Emit(const string &eventType, const string &payloadJson)
     {
      string envelope = "{";
      envelope += "\"event\":\""    + eventType     + "\",";
      envelope += "\"time\":\""     + NowIso()      + "\",";
      envelope += "\"data\":"       + payloadJson;
      envelope += "}";
      return PostJson(envelope, eventType);
     }

public:
   //--- constructor -------------------------------------------------
                      CWBotWebConnector(void) :
        m_enabled(false),
        m_apiUrl(""),
        m_apiKey(""),
        m_timeoutMs(5000),
        m_updateInterval(10),
        m_symbol(""),
        m_magic(0),
        m_online(false),
        m_eventsSent(0),
        m_eventsFailed(0),
        m_lastSyncTime(0),
        m_failWarned(false)
      {
      }

   //--- configuration ----------------------------------------------
   void               Configure(const bool   enabled,
                                const string apiUrl,
                                const string apiKey,
                                const int    timeoutMs,
                                const int    updateIntervalSec,
                                const string symbol,
                                const ulong  magic)
     {
      m_enabled   = enabled;
      m_apiUrl    = apiUrl;
      m_apiKey    = apiKey;
      m_timeoutMs = (timeoutMs > 0) ? timeoutMs : 5000;
      m_updateInterval = (updateIntervalSec > 0) ? updateIntervalSec : 10;
      m_symbol    = symbol;
      m_magic     = magic;
     }

   //--- accessors --------------------------------------------------
   bool               IsEnabled(void)   const { return m_enabled; }
   bool               IsOnline(void)    const { return m_online; }
   int                EventsSent(void)  const { return m_eventsSent; }
   int                EventsFailed(void)const { return m_eventsFailed; }

   //=================================================================
   //  IMMEDIATE EVENT EMITTERS  (called from OnTradeTransaction)
   //=================================================================

   //--- trade OPENED ------------------------------------------------
   void               EmitTradeOpen(const ulong ticket)
     {
      if(!m_enabled) return;
      string payload = BuildOpenTradeJson(ticket);
      if(payload == "") return;
      // include a fresh account snapshot alongside the trade
      payload = "{\"account\":" + BuildAccountJson() +
                ",\"trade\":"   + payload + "}";
      Emit(WBOT_EVT_TRADE_OPEN, payload);
     }

   //--- trade MODIFIED (SL/TP/volume changed) ----------------------
   void               EmitTradeModify(const ulong ticket)
     {
      if(!m_enabled) return;
      string payload = BuildOpenTradeJson(ticket);
      if(payload == "") return;
      Emit(WBOT_EVT_TRADE_MODIFY, payload);
     }

   //--- trade CLOSED -----------------------------------------------
   //   uses the closing deal to build entry/exit/profit/duration
   void               EmitTradeClose(const ulong dealTicket)
     {
      if(!m_enabled) return;
      string payload = BuildClosedTradeJson(dealTicket);
      if(payload == "") return;
      // include a fresh account snapshot (equity changed)
      payload = "{\"account\":" + BuildAccountJson() +
                ",\"trade\":"   + payload + "}";
      Emit(WBOT_EVT_TRADE_CLOSE, payload);
     }

   //=================================================================
   //  PERIODIC FULL SYNC  (called from OnTick, throttled)
   //=================================================================
   void               MaybeFullSync(void)
     {
      if(!m_enabled) return;

      datetime now = TimeCurrent();
      if(m_lastSyncTime > 0 && (now - m_lastSyncTime) < m_updateInterval)
         return;
      m_lastSyncTime = now;

      FullSync();
     }

   //--- push account + all open trades in one envelope -------------
   void               FullSync(void)
     {
      if(!m_enabled) return;
      string payload = "{\"account\":"      + BuildAccountJson() +
                       ",\"openTrades\":"   + BuildOpenTradesJson() + "}";
      Emit(WBOT_EVT_FULL_SYNC, payload);
     }

   //=================================================================
   //  CONNECTION LIFECYCLE
   //=================================================================
   void               EmitConnection(const string status,
                                     const string message = "")
     {
      if(!m_enabled) return;
      string payload;
      if(message != "")
         payload = "{\"status\":\"" + status + "\",\"message\":\"" + JsonEscape(message) + "\"}";
      else
         payload = "{\"status\":\"" + status + "\"}";
      Emit(WBOT_EVT_CONNECTION, payload);
     }
  };

//--- global singleton
CWBotWebConnector WWeb;

#endif // __WBOT_WEBCONNECTOR_MQH__
