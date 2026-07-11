//+------------------------------------------------------------------+
//| WBot_Telegram.mqh                                                |
//| Bulletproof Telegram notifier (preserved logic + error handling) |
//+------------------------------------------------------------------+
#ifndef __WBOT_TELEGRAM_MQH__
#define __WBOT_TELEGRAM_MQH__

#include "WBot_Logger.mqh"

//====================================================================
//  TELEGRAM MODULE
//====================================================================
class CWBotTelegram
  {
private:
   string m_token;
   string m_chatId;
   bool   m_enabled;
   bool   m_connectionOK;
   int    m_messagesSent;

public:
   //--- constructor
                      CWBotTelegram(void) :
        m_token(""),
        m_chatId(""),
        m_enabled(false),
        m_connectionOK(true),
        m_messagesSent(0)
      {
      }

   //--- configuration -------------------------------------------------
   void               Configure(const string token,
                                const string chatId,
                                bool         enabled)
     {
      m_token   = token;
      m_chatId  = chatId;
      m_enabled = enabled;
     }

   bool               IsEnabled(void)      const { return m_enabled; }
   bool               IsConnectionOK(void) const { return m_connectionOK; }
   int                MessagesSent(void)   const { return m_messagesSent; }

   //--- HTML-escape a message (preserved from original) --------------
private:
   string             EscapeHtml(const string msg)
     {
      string s = msg;
      StringReplace(s, "&", "&amp;");
      StringReplace(s, "<", "&lt;");
      StringReplace(s, ">", "&gt;");
      return s;
     }

   //--- core send -----------------------------------------------------
public:
   void               Send(const string msg)
     {
      if(!m_enabled || m_token == "" || m_chatId == "")
         return;

      string url = "https://api.telegram.org/bot" + m_token + "/sendMessage";
      string sm  = EscapeHtml(msg);
      string jp  = "{\"chat_id\":\"" + m_chatId + "\",\"text\":\"" + sm +
                   "\",\"parse_mode\":\"HTML\"}";

      uchar post[];
      StringToCharArray(jp, post, 0, WHOLE_ARRAY, CP_UTF8);

      string hdr = "Content-Type: application/json\r\n";
      uchar  res[];
      string rh;

      ResetLastError();
      int r = WebRequest("POST", url, hdr, 5000, post, res, rh);

      if(r == -1)
        {
         // request never left the terminal (whitelist/network error)
         if(m_connectionOK)
            WLog.Warn("Telegram: WebRequest failed - check URL whitelist in Terminal options");
         m_connectionOK = false;
        }
      else if(r == 200)
        {
         if(!m_connectionOK)
            WLog.Info("Telegram: connection restored");
         m_connectionOK = true;
         m_messagesSent++;
        }
      else
        {
         if(m_connectionOK)
            WLog.Warn(StringFormat("Telegram: HTTP %d response", r));
         m_connectionOK = false;
        }
     }
  };

//--- global singleton
CWBotTelegram WTelegram;

#endif // __WBOT_TELEGRAM_MQH__
