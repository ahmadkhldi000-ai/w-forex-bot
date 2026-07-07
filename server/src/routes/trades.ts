import { Router } from "express";
import { prisma } from "@/config/db.js";
import { success, handleError, AppError } from "@/utils/errors.js";
import { requireUser } from "@/middleware/auth.js";
import { getConnectionStatus, getLatestSnapshot } from "@/services/mt5-socket.js";

const router = Router();

// --------------------------------------------------------------------
//  GET /api/trades  — current user's trades (from MT5)
// --------------------------------------------------------------------
router.get("/", requireUser, async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      where: { userId: req.user!.id },
      orderBy: { openTime: "desc" },
      take: 100,
    });
    return success(res, trades);
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /api/trades/stats  — aggregated performance stats
// --------------------------------------------------------------------
router.get("/stats", requireUser, async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      where: { userId: req.user!.id, status: "CLOSED" },
      select: { netProfit: true, profit: true },
    });

    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.netProfit > 0).length;
    const losses = trades.filter((t) => t.netProfit <= 0).length;
    const totalPnl = trades.reduce((sum, t) => sum + t.netProfit, 0);
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const avgWin =
      wins > 0 ? trades.filter((t) => t.netProfit > 0).reduce((s, t) => s + t.netProfit, 0) / wins : 0;
    const avgLoss =
      losses > 0
        ? trades.filter((t) => t.netProfit <= 0).reduce((s, t) => s + t.netProfit, 0) / losses
        : 0;

    // Integrity/transparency: return ALL stats including losses
    return success(res, {
      totalTrades,
      wins,
      losses,
      winRate: Math.round(winRate * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor:
        avgLoss !== 0 ? Math.round((avgWin / Math.abs(avgLoss)) * 100) / 100 : 0,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /api/trades/live  — latest MT5 snapshot + connection status
// --------------------------------------------------------------------
router.get("/live", requireUser, async (_req, res) => {
  try {
    return success(res, {
      connection: getConnectionStatus(),
      snapshot: getLatestSnapshot(),
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /api/trades/positions — open positions count
// --------------------------------------------------------------------
router.get("/positions", requireUser, async (req, res) => {
  try {
    const count = await prisma.trade.count({
      where: { userId: req.user!.id, status: "OPEN" },
    });
    return success(res, { openPositions: count });
  } catch (err) {
    return handleError(res, err);
  }
});

export default router;
