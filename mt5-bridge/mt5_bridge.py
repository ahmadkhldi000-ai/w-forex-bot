"""
====================================================================
  W-FOREX-BOT · MT5 Bridge (Python)
  Connects to MetaTrader 5 terminal and streams live data
  to the Node.js backend via Socket.io.

  Requirements:
    pip install MetaTrader5 socketio[asyncio_client] python-dotenv

  Architecture:
    [MT5 Terminal] → [this bridge] → [Node.js server] → [dashboards]

  Runs on Windows (MT5 requirement). The Node server can run anywhere.
====================================================================
"""

import os
import sys
import json
import time
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

import socketio
from dotenv import load_dotenv

load_dotenv()

# --------------------------------------------------------------------
#  CONFIG
# --------------------------------------------------------------------
MT5_LOGIN = int(os.getenv("MT5_LOGIN", "0"))
MT5_PASSWORD = os.getenv("MT5_PASSWORD", "")
MT5_SERVER = os.getenv("MT5_SERVER", "")

SERVER_URL = os.getenv("SERVER_URL", "http://localhost:4000")
BRIDGE_SECRET = os.getenv("BRIDGE_SECRET", "change-me")

# Polling interval (seconds)
POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "1.0"))

# --------------------------------------------------------------------
#  LOGGING
# --------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("mt5-bridge")

# --------------------------------------------------------------------
#  MT5 CONNECTION
# --------------------------------------------------------------------
mt5 = None  # lazy import — only available on Windows with MT5 installed


def connect_mt5() -> bool:
    """Initialize MT5 connection. Returns True on success."""
    global mt5
    try:
        import MetaTrader5 as mt5  # type: ignore
    except ImportError:
        log.error("MetaTrader5 package not installed. Run: pip install MetaTrader5")
        log.error("Note: MT5 bridge must run on Windows with MT5 terminal installed.")
        return False

    if not mt5.initialize(login=MT5_LOGIN, password=MT5_PASSWORD, server=MT5_SERVER):
        log.error(f"MT5 initialize() failed: {mt5.last_error()}")
        return False

    info = mt5.account_info()
    if info is None:
        log.error("Failed to get account info")
        return False

    log.info(f"✅ Connected to MT5 — {info.server} | Login: {info.login} | Balance: {info.balance}")
    return True


def get_account_snapshot() -> Optional[dict]:
    """Get current account equity/balance/margin snapshot."""
    if mt5 is None:
        return None
    try:
        info = mt5.account_info()
        if info is None:
            return None
        return {
            "type": "equity",
            "balance": float(info.balance),
            "equity": float(info.equity),
            "margin": float(info.margin),
            "freeMargin": float(info.margin_free),
            "time": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        log.error(f"snapshot error: {e}")
        return None


def get_positions() -> Optional[dict]:
    """Get open positions count."""
    if mt5 is None:
        return None
    try:
        positions = mt5.positions_get()
        count = len(positions) if positions else 0
        return {
            "type": "positions",
            "count": count,
            "time": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        log.error(f"positions error: {e}")
        return None


# Track known tickets to detect new opens / closes
known_tickets: set[int] = set()


def detect_trade_events() -> list[dict]:
    """Detect newly opened or closed trades."""
    if mt5 is None:
        return []
    events = []
    try:
        positions = mt5.positions_get() or []
        current_tickets = {p.ticket for p in positions}

        # Newly opened
        for p in positions:
            if p.ticket not in known_tickets:
                events.append({
                    "type": "trade_open",
                    "ticket": int(p.ticket),
                    "symbol": p.symbol,
                    "volume": float(p.volume),
                    "tradeType": "BUY" if p.type == 0 else "SELL",
                    "price": float(p.price_open),
                    "time": datetime.now(timezone.utc).isoformat(),
                })

        # Closed (was known, now gone)
        for ticket in known_tickets - current_tickets:
            # Get from history for profit
            deals = mt5.history_deals_get(ticket=ticket)
            profit = float(deals[0].profit) if deals else 0.0
            events.append({
                "type": "trade_close",
                "ticket": int(ticket),
                "symbol": "",
                "profit": profit,
                "closePrice": 0,
                "time": datetime.now(timezone.utc).isoformat(),
            })

        known_tickets.clear()
        known_tickets.update(current_tickets)
    except Exception as e:
        log.error(f"trade events error: {e}")
    return events


# --------------------------------------------------------------------
#  SOCKET.IO CLIENT → streams to Node.js server
# --------------------------------------------------------------------
sio = socketio.AsyncClient()


@sio.event
async def connect():
    log.info(f"✅ Connected to server: {SERVER_URL}")
    await sio.emit("mt5:event", {
        "type": "connection",
        "status": "connected",
        "message": "MT5 bridge online",
        "time": datetime.now(timezone.utc).isoformat(),
    })


@sio.event
async def disconnect():
    log.warning("Disconnected from server")


async def stream_loop():
    """Main polling loop — streams MT5 data to the server."""
    log.info("Starting MT5 stream loop...")
    while True:
        try:
            # Account snapshot
            snapshot = get_account_snapshot()
            if snapshot:
                await sio.emit("mt5:event", snapshot)

            # Positions count
            positions = get_positions()
            if positions:
                await sio.emit("mt5:event", positions)

            # Trade events (open/close)
            for event in detect_trade_events():
                await sio.emit("mt5:event", event)
                log.info(f"📡 Trade event: {event['type']} ticket={event.get('ticket')}")

        except Exception as e:
            log.error(f"stream error: {e}")

        await asyncio.sleep(POLL_INTERVAL)


# --------------------------------------------------------------------
#  MAIN
# --------------------------------------------------------------------
async def main():
    log.info("=" * 60)
    log.info("  W-FOREX-BOT · MT5 Bridge")
    log.info("=" * 60)

    # Connect to MT5 first
    if not connect_mt5():
        log.error("Cannot start without MT5 connection. Exiting.")
        sys.exit(1)

    # Connect to Node.js server
    try:
        await sio.connect(
            SERVER_URL,
            socketio_path="/api/socket",
            auth={"role": "bridge", "secret": BRIDGE_SECRET},
            transports=["websocket"],
        )
    except Exception as e:
        log.error(f"Failed to connect to server: {e}")
        sys.exit(1)

    # Start streaming
    try:
        await stream_loop()
    except asyncio.CancelledError:
        pass
    finally:
        await sio.disconnect()
        if mt5 is not None:
            mt5.shutdown()
        log.info("Bridge shut down.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("Stopped by user")
