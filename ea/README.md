# 🤖 W Forex Bot — Expert Advisor (Modular)

Clean, modular MQL5 refactor of `Quantum_M1_Inst_DCA_v9.3` (now **v9.31**).

> ⚠️ **The trading strategy is 100% unchanged.** Entry conditions, exit
> conditions, DCA grid math, lot sizing, R:R, and the 3-tier scale-out are
> byte-for-byte equivalent to v9.3. This refactor adds **only** technical
> improvements: code organization, performance, error handling, logging, an
> internal performance monitor, and a Web Connector integration point.

---

## 📁 Structure

```
ea/
├── W_Forex_Bot.mq5                  # Thin orchestrator (event handlers only)
└── Include/WBot/
    ├── WBot_Config.mqh              # All inputs (grouped, prefixed Inp*)
    ├── WBot_Logger.mqh              # Leveled logging (DEBUG/INFO/WARN/ERROR)
    ├── WBot_Telegram.mqh            # Bulletproof Telegram notifier
    ├── WBot_Indicators.mqh          # ATR(14) handle + swing-structure helpers
    ├── WBot_Signals.mqh             # VWAP + volatility + imbalance engines
    ├── WBot_Risk.mqh                # Position sizing
    ├── WBot_DcaGrid.mqh             # Dynamic DCA zone state machine
    ├── WBot_Execution.mqh           # ExecuteBuy / ExecuteSell (+ telemetry)
    ├── WBot_Exits.mqh               # 3-tier scale-out + ATR trailing
    ├── WBot_Performance.mqh         # Internal performance monitor (NEW)
    └── WBot_WebConnector.mqh        # HTTP event emitter (NEW)
```

### Architecture principle
Each module is a **singleton class** (`WIndicators`, `WGrid`, `WExec`, …) with
a clean lifecycle: `Init()` → use → `Deinit()`. The main file is **only** an
event-handler shell that wires them together. No strategy logic lives in the
main file.

---

## 🔌 What changed (and what didn't)

### ✅ Unchanged — trading behaviour
| Aspect | Status |
|---|---|
| BUY/SELL entry conditions | Identical (VWAP + imbalance candle) |
| DCA grid spacing & lot multiplier | Identical (`ATR × mult × volMult`) |
| Structure SL / RR TP | Identical |
| 3-tier scale-out (1R→BE, 2R→lock) | Identical |
| ATR trailing (final 1/3) | Identical |
| Lot sizing formula | Identical |
| Cooldown logic | Identical |
| Spread protection | Identical |

### 🆕 Added — technical improvements
1. **Modularity** — 10 focused modules instead of one 700-line file.
2. **Leveled logging** — `WLog` with DEBUG/INFO/WARN/ERROR, routed to the
   Experts tab. Every order, tier transition, and error is logged.
3. **Error handling** — order failures now surface `ResultRetcode()` + description;
   ATR/VWAP init failures are checked and logged; Telegram connection drops
   are detected and reported once (no spam).
4. **Internal performance monitor** (`WPerf`) — tracks:
   - Total trades, wins/losses, win-rate %
   - Cumulative PnL, net return %
   - Peak equity, max drawdown (absolute & %)
   - Average per-tick processing latency (ms)
   - Emits a summary log line on a configurable cadence.
5. **Web Connector** (`WWeb`) — emits events to the external platform.
6. **Performance** — ATR indicator handle created once and reused (was already
   so in v9.3, now made explicit via `WIndicators`); tick processing timed.

---

## 🌐 Web Connector (standalone module)

`WBot_WebConnector.mqh` is a **standalone module** inside the EA that streams the
bot's live state to an external platform over **HTTPS REST (POST)**, authenticated
with an **API key** (`X-API-Key` header). It is wired into `OnTradeTransaction()`
for **immediate** open / modify / close updates, and runs a periodic full sync on
a configurable interval.

> 🔒 **Resilience:** every network call is wrapped. If the API is unreachable, the
> connector logs the failure once and keeps counting — **the bot continues trading
> without interruption.**

### Settings
| Input | Meaning |
|---|---|
| `InpEnableWebConnector` | Enable / disable the connector |
| `InpAPI_URL` | Endpoint URL (`API_URL`) |
| `InpAPI_KEY` | API key sent as `X-API-Key` header (`API_KEY`) |
| `InpUPDATE_INTERVAL` | Periodic full-sync cadence in seconds (`UPDATE_INTERVAL`) |
| `InpWebConnectorTimeoutMs` | Per-request HTTP timeout (ms) |

> **Important:** whitelist `InpAPI_URL` in MT5 → Tools → Options → Expert
> Advisors → "Allow WebRequest for listed URL".

### Data pushed
Every event is a JSON envelope:
```json
{ "event": "<type>", "time": "2026.07.09 22:35:10", "data": { ... } }
```

**Account** (number, broker, server, balance, equity, margin, drawdown):
```json
{ "accountNumber": 1234567, "broker": "ICMarkets", "server": "ICMarkets-Live",
  "balance": 5000.00, "equity": 5120.30, "margin": 220.00,
  "drawdown": 12.40, "drawdownPct": 0.24, "currency": "USD",
  "leverage": 500, "symbol": "EURUSD", "time": "..." }
```

**Open trades** (ticket, symbol, BUY/SELL, lot, entry, current, SL, TP, profit, open time):
```json
[{ "ticket": 5001, "symbol": "EURUSD", "side": "BUY", "lot": 0.12,
   "entryPrice": 1.08500, "currentPrice": 1.08620, "sl": 1.08300, "tp": 1.09000,
   "profit": 14.40, "openTime": "2026.07.09 22:10:00", "magic": 20260617 }]
```

**Closed trade** (entry, exit, profit, duration):
```json
{ "ticket": 7700, "symbol": "EURUSD", "side": "BUY",
  "entryPrice": 1.08500, "exitPrice": 1.08700, "profit": 24.00,
  "entryTime": "2026.07.09 22:10:00", "exitTime": "2026.07.09 22:25:00",
  "durationSec": 900, "magic": 20260617 }
```

### Event types & when they fire
| Event | Fires when |
|---|---|
| `connection` | EA start (`connected`) / stop (`disconnected`) |
| `trade_open` | A deal with `DEAL_ENTRY_IN` (immediate, via `OnTradeTransaction`) |
| `trade_modify` | A position's SL/TP/volume changes (immediate, via `OnTradeTransaction`) |
| `trade_close` | A deal with `DEAL_ENTRY_OUT` (immediate, via `OnTradeTransaction`) |
| `full_sync` | Every `UPDATE_INTERVAL` seconds (account + all open trades) |

### Server-side wiring
Add a route on the backend that receives these envelopes (and optionally re-broadcasts
them to dashboards via Socket.io):
```ts
// server/src/routes/connector.ts
import { Router } from "express";
import { getIO } from "@/services/mt5-socket.js";

const router = Router();

// the EA posts envelopes with X-API-Key auth
router.post("/", (req, res) => {
  const apiKey = req.header("X-API-Key");
  if (!apiKey || apiKey !== process.env.CONNECTOR_API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }
  // re-broadcast to dashboard clients on the same bus the Python bridge uses
  getIO()?.to("clients").emit("mt5:event", req.body);
  res.json({ ok: true });
});

export default router;
```
```ts
// server/src/index.ts
import connectorRoutes from "@/routes/connector.js";
app.use("/api/connector", connectorRoutes);
```

---

## 🚀 Installation

1. Copy the `ea/` folder into your MT5 data directory:
   - `W_Forex_Bot.mq5` → `MQL5/Experts/`
   - `Include/WBot/` → `MQL5/Include/WBot/`
2. Open `W_Forex_Bot.mq5` in MetaEditor and press **F7** (compile).
3. Attach to an M1 chart.
4. **Whitelist** `api.telegram.org` (and your connector URL if enabled) in
   Terminal → Options → Expert Advisors.

---

## 📊 Monitoring output

The internal monitor logs a line like this every `InpMonitorIntervalSec`
(default 30s):

```
[INFO] [2026.07.09 22:35:10] Monitor | trades=14 W/L=9/5 (64.3%) PnL=$182.40 ret=3.6% DD=1.8% peak=$5182.40 avgTick=0.4ms
```

On shutdown, `OnDeinit` logs a final summary with the same fields.
