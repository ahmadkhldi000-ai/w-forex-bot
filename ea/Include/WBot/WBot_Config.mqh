//+------------------------------------------------------------------+
//| WBot_Config.mqh                                                  |
//| All user-tunable inputs for the W Forex Bot                      |
//| (Strategy parameters preserved verbatim from v9.3)               |
//+------------------------------------------------------------------+
#ifndef __WBOT_CONFIG_MQH__
#define __WBOT_CONFIG_MQH__

//====================================================================
//  QUANTUM CORE
//====================================================================
input group "━━━ QUANTUM CORE (M1) ━━━"
input ulong InpMagicNumber       = 20260617;   // Magic number
input int    InpMaxOpenTrades    = 8;          // Max concurrent trades

//====================================================================
//  DYNAMIC DCA GRID
//====================================================================
input group "━━★ DYNAMIC DCA GRID (M1) ★━"
input int    InpMaxDCA_Levels       = 6;    // Max DCA levels
input double InpDCA_BaseStep_ATR_Mult = 0.8; // Grid step = ATR x mult
input double InpDCA_LotMultiplier    = 1.3; // Lot growth per level
input double InpDCA_MaxLotMult       = 3.0; // Cap on lot growth
input bool   InpDCA_WaitCandleClose  = true;// Wait for candle close

//====================================================================
//  VWAP FLEXIBLE BIAS
//====================================================================
input group "━━★ VWAP FLEXIBLE BIAS (M1) ★━"
input bool   InpUseVWAP_Filter     = true;  // Enable VWAP filter
input double InpVWAP_Allowance_Pts = 50;    // Sell-side allowance (pts)

//====================================================================
//  VOLATILITY ACCELERATION ENGINE
//====================================================================
input group "━━★ VOLATILITY ACCELERATION ENGINE (M1) ★━"
input bool   InpUseDynamicVola    = true;  // Enable dynamic volatility
input double InpVola_Expand_Mult  = 1.6;   // Multiplier on expanding vol
input double InpVola_Shrink_Mult  = 0.6;   // Multiplier on shrinking vol

//====================================================================
//  TICK LIQUIDITY IMBALANCE
//====================================================================
input group "━━★ TICK LIQUIDITY IMBALANCE (M1) ★━"
input bool   InpUseTickImbalance   = true;  // Enable imbalance filter
input double InpImbalance_Threshold = 0.25; // Wick/body threshold

//====================================================================
//  SMART STRUCTURE SL/TP
//====================================================================
input group "━━★ SMART STRUCTURE SL/TP (M1) ★━"
input int    InpStructure_Lookback   = 60;  // Swing lookback (bars)
input double InpRiskRewardRatio      = 1.8; // R:R ratio
input double InpStructure_Buffer_ATR = 0.1; // SL/TP buffer = ATR x mult

//====================================================================
//  RISK MANAGEMENT
//====================================================================
input group "━━━ RISK MANAGEMENT (M1) ━━━"
input double InpBaseRiskPercent  = 0.5; // Risk % per trade (of balance)
input double InpATR_MultiplierSL = 1.0; // (reserved, kept for parity)
input int    InpMaxSpreadPoints  = 25;  // Max allowed spread (points)

//====================================================================
//  3-TIER EXIT SYSTEM (1/3 each)
//====================================================================
input group "━━★ 3-TIER EXIT SYSTEM (1/3 EACH) ★━"
input bool   InpEnableSmartScaleOut = true; // Enable 3-tier exit
input double InpTier1_ClosePct      = 33.33;// Tier 1: close 1/3
input double InpTier1_TP_Mult       = 1.0;  // Tier 1: trigger at 1R
input double InpTier2_ClosePct      = 50.0; // Tier 2: close half of rest
input double InpTier2_TP_Mult       = 2.0;  // Tier 2: trigger at 2R

//====================================================================
//  ATR TRAILING STOP (final 1/3)
//====================================================================
input group "━━★ ATR TRAILING STOP (For Final 1/3) ★━"
input bool   InpUseATRTrailing  = true; // Enable ATR trailing
input double InpATR_Trailing_Mult = 1.5; // Trail distance = ATR x mult

//====================================================================
//  COOLDOWN
//====================================================================
input group "━━━ COOLDOWN (M1) ━━━"
input int    InpCooldownBars = 5; // Bars of cooldown after full close

//====================================================================
//  TELEGRAM
//====================================================================
input group "━━━ TELEGRAM ━━━"
input string InpTelegramToken = "7970131592:AAFqpL8t7Nj1IbeKR1_vZiaW1wB66jpJx6g";
input string InpTelegramChatID = "-1004394697587";
input bool   InpEnableTelegram = true;

//====================================================================
//  LOGGING & INTERNAL MONITORING
//====================================================================
input group "━━━ LOGGING & INTERNAL MONITORING ━━━"
input bool   InpEnableMonitoring   = true; // Internal performance monitor
input int    InpMonitorIntervalSec = 30;   // Monitor report cadence (sec)

//====================================================================
//  WEB CONNECTOR  (W Forex Bot Web Connector module)
//  Streams account + open/closed trades to an external REST API.
//  HTTPS POST with API-Key authentication. On failure the bot keeps
//  running uninterrupted.
//====================================================================
input group "━━★ WEB CONNECTOR (REST API) ★━"
input bool   InpEnableWebConnector = true;        // Enable the connector
input string InpAPI_URL  = "https://api.wforexbot.com/api/connector"; // API_URL
input string InpAPI_KEY  = "";                    // API_KEY (X-API-Key header)
input int    InpUPDATE_INTERVAL = 10;             // UPDATE_INTERVAL (seconds)
input int    InpWebConnectorTimeoutMs = 5000;     // HTTP request timeout (ms)

#endif // __WBOT_CONFIG_MQH__
