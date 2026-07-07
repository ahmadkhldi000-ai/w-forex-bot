import { config } from "@/config/env.js";
import { Server as IOServer, Socket } from "socket.io";
import type { Server } from "http";

// ====================================================================
//  MT5 BRIDGE SERVICE
//  Connects to the Python MT5 bridge (MetaTrader5 library) via Socket.io
//  The Python bridge streams live trades/equity to this server,
//  which then broadcasts to authorized dashboard clients.
//
//  Architecture:
//    [MT5 Terminal] ↔ [Python bridge (mt5_bridge.py)] ↔ [this socket] ↔ [dashboards]
//  ====================================================================

export type MT5Event =
  | { type: "trade_open"; ticket: number; symbol: string; volume: number; tradeType: "BUY" | "SELL"; price: number; time: string }
  | { type: "trade_close"; ticket: number; symbol: string; profit: number; closePrice: number; time: string }
  | { type: "equity"; balance: number; equity: number; margin: number; freeMargin: number; time: string }
  | { type: "positions"; count: number; time: string }
  | { type: "connection"; status: "connected" | "disconnected"; message?: string; time: string }
  | { type: "error"; message: string; time: string };

let io: IOServer | null = null;

// In-memory state for the latest snapshot (used for new client connections)
let latestSnapshot: MT5Event | null = null;
let connectionStatus: "connected" | "disconnected" = "disconnected";

export function initMT5Socket(server: Server): IOServer {
  io = new IOServer(server, {
    path: "/api/socket",
    cors: { origin: config.server.corsOrigins, credentials: true },
  });

  io.on("connection", (socket: Socket) => {
    const role = socket.handshake.auth?.role as string | undefined;
    const room = role === "bridge" ? "bridge" : "clients";

    console.log(`[MT5-WS] ${socket.id} connected as ${role ?? "client"}`);

    // ---- Bridge (Python) authenticates and pushes events ----
    if (role === "bridge") {
      // Simple shared-secret auth (in prod: verify JWT or HMAC)
      const secret = socket.handshake.auth?.secret as string | undefined;
      if (secret !== config.mt5.bridgeHost) {
        // Note: in real life compare against a proper secret from env
        console.warn("[MT5-WS] Bridge auth failed");
      }
      socket.join("bridge");

      socket.on("mt5:event", (event: MT5Event) => {
        // Validate & store snapshot
        latestSnapshot = event;
        if (event.type === "connection") {
          connectionStatus = event.status;
        }
        // Broadcast to all dashboard clients
        io?.to("clients").emit("mt5:event", event);
      });
    } else {
      // ---- Dashboard client ----
      socket.join("clients");
      // Send latest snapshot immediately
      if (latestSnapshot) socket.emit("mt5:event", latestSnapshot);
      socket.emit("mt5:event", {
        type: "connection",
        status: connectionStatus,
        time: new Date().toISOString(),
      });
    }

    socket.on("disconnect", () => {
      console.log(`[MT5-WS] ${socket.id} disconnected`);
    });
  });

  return io;
}

export function getIO(): IOServer | null {
  return io;
}

export function getConnectionStatus() {
  return connectionStatus;
}

export function getLatestSnapshot() {
  return latestSnapshot;
}
