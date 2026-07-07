# MT5 Bridge

Python service that connects to the MetaTrader 5 terminal and streams live trading data to the W-Forex Bot backend.

## ⚠️ Requirements

- **Windows** with MetaTrader 5 terminal installed (MT5 Python library only works on Windows)
- Python 3.10+

## Setup

```bash
cd mt5-bridge
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MT5 credentials
```

## Run

```bash
python mt5_bridge.py
```

## Architecture

```
[MT5 Terminal]  →  [mt5_bridge.py (Windows)]  →  [Node.js server]  →  [Dashboards]
                  polls every 1s                    Socket.io          real-time
```

The bridge authenticates to the Node.js server via Socket.io (`/api/socket`) with role `bridge`, then emits `mt5:event` messages containing:

- `equity` — account balance/equity/margin snapshot
- `positions` — open positions count
- `trade_open` / `trade_close` — individual trade events
- `connection` — bridge status
