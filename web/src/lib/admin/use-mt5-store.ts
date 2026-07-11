"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type MT5Account,
  type MT5AccountInput,
  type ActivityLog,
  type LogAction,
  type MT5Server,
} from "./mt5-types";
import { SERVER_LABELS } from "./mt5-types";

// ====================================================================
//  MT5 + Audit Log store
//
//  Client-side implementation that mirrors the server REST contract
//  (server/src/routes/mt5-accounts.ts). The invariants — exactly one
//  active account, exactly one master — are enforced here identically
//  to the backend. To go live, replace these functions with fetch()
//  calls to /api/management/mt5/* and /api/management/audit-logs.
// ====================================================================

const LS_ACCOUNTS = "wfb_mt5_accounts";
const LS_LOGS = "wfb_activity_logs";

function uid(prefix = "a"): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
function now(): string {
  return new Date().toISOString();
}

const ADMIN_ID = "admin-local";
const ADMIN_NAME = "Ahmad K.";
const ADMIN_IP = "188.45.12.90";

// ---- seed data ----
function seedAccounts(): MT5Account[] {
  const t = Date.now();
  return [
    {
      id: "mt5_main",
      label: "Primary — Prop Firm",
      login: "5123 8841",
      server: "ICMARKETS_REAL",
      serverName: "ICMarketsSC-Live21",
      currency: "USD",
      leverage: 100,
      balance: 48230.55,
      equity: 49102.18,
      isActive: true,
      isMaster: true,
      isActiveConn: true,
      createdBy: ADMIN_ID,
      lastConnectedAt: new Date(t - 2 * 60_000).toISOString(),
      createdAt: new Date(t - 14 * 86400_000).toISOString(),
      updatedAt: new Date(t - 60_000).toISOString(),
    },
    {
      id: "mt5_demo",
      label: "Strategy Tester",
      login: "6104 2273",
      server: "METAQUOTES_DEMO",
      serverName: "MetaQuotes-Demo",
      currency: "USD",
      leverage: 500,
      balance: 10000.0,
      equity: 9842.5,
      isActive: false,
      isMaster: false,
      isActiveConn: false,
      createdBy: ADMIN_ID,
      lastConnectedAt: new Date(t - 3 * 86400_000).toISOString(),
      createdAt: new Date(t - 30 * 86400_000).toISOString(),
      updatedAt: new Date(t - 3 * 86400_000).toISOString(),
    },
    {
      id: "mt5_gold",
      label: "Gold Scalper — Pepperstone",
      login: "2000 1190",
      server: "PEPPERSTONE_REAL",
      serverName: "Pepperstone-Real06",
      currency: "USD",
      leverage: 200,
      balance: 22750.0,
      equity: 22110.4,
      isActive: false,
      isMaster: false,
      isActiveConn: false,
      lastError: "Invalid credentials",
      createdBy: ADMIN_ID,
      lastConnectedAt: new Date(t - 8 * 86400_000).toISOString(),
      createdAt: new Date(t - 52 * 86400_000).toISOString(),
      updatedAt: new Date(t - 6 * 3600_000).toISOString(),
    },
  ];
}

function seedLogs(): ActivityLog[] {
  const t = Date.now();
  const mk = (mins: number, action: LogAction, resource: string, details: Record<string, unknown>): ActivityLog => ({
    id: uid("log"),
    adminId: ADMIN_ID,
    adminName: ADMIN_NAME,
    action,
    resource,
    ipAddress: ADMIN_IP,
    details,
    createdAt: new Date(t - mins * 60_000).toISOString(),
  });
  return [
    mk(4, "MT5_ACTION", "mt5_account", { action: "connect", label: "Primary — Prop Firm" }),
    mk(38, "2FA_ENABLED", "admin", { method: "TOTP (Google Authenticator)" }),
    mk(52, "MT5_ACTION", "mt5_account", { action: "set_master", label: "Primary — Prop Firm" }),
    mk(53, "MT5_ACTION", "mt5_account", { action: "set_active", label: "Primary — Prop Firm" }),
    mk(120, "UPDATE", "mt5_account", { label: "Gold Scalper — Pepperstone", fields: ["leverage"] }),
    mk(180, "CREATE", "mt5_account", { label: "Gold Scalper — Pepperstone", server: SERVER_LABELS.PEPPERSTONE_REAL }),
    mk(320, "FAILED_LOGIN", "admin", { reason: "Invalid 2FA code", attempts: 1 }),
    mk(540, "DELETE", "mt5_account", { label: "Old FTMO Account", login: "4410 8830" }),
    mk(1440, "LOGIN", "admin", { method: "password + 2FA", device: "macOS · Chrome" }),
    mk(2880, "SETTINGS_CHANGE", "setting", { key: "max_leverage_global" }),
  ];
}

function load<T>(key: string, seed: () => T): T {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  const s = seed();
  try {
    localStorage.setItem(key, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  return s;
}

// ---- public hook ----
export function useMt5Store() {
  const [accounts, setAccounts] = useState<MT5Account[]>(() => load(LS_ACCOUNTS, seedAccounts));
  const [logs, setLogs] = useState<ActivityLog[]>(() => load(LS_LOGS, seedLogs));

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
    } catch {}
  }, [accounts]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_LOGS, JSON.stringify(logs));
    } catch {}
  }, [logs]);

  const pushLog = useCallback(
    (action: LogAction, resource: string, details: Record<string, unknown>) => {
      const entry: ActivityLog = {
        id: uid("log"),
        adminId: ADMIN_ID,
        adminName: ADMIN_NAME,
        action,
        resource,
        ipAddress: ADMIN_IP,
        details,
        createdAt: now(),
      };
      setLogs((prev) => [entry, ...prev].slice(0, 200));
    },
    []
  );

  // ---- CREATE ----
  const addAccount = useCallback(
    (input: MT5AccountInput): MT5Account => {
      let created!: MT5Account;
      setAccounts((prev) => {
        // enforce single-active / single-master
        let next = prev;
        if (input.makeActive) next = next.map((a) => ({ ...a, isActive: false }));
        if (input.makeMaster) next = next.map((a) => ({ ...a, isMaster: false }));
        created = {
          id: uid("mt5"),
          label: input.label,
          login: input.login,
          server: input.server,
          serverName: input.serverName,
          currency: input.currency ?? "USD",
          leverage: input.leverage ?? 100,
          balance: 0,
          equity: 0,
          isActive: !!input.makeActive,
          isMaster: !!input.makeMaster,
          isActiveConn: false,
          createdBy: ADMIN_ID,
          createdAt: now(),
          updatedAt: now(),
        };
        return [created, ...next];
      });
      pushLog("CREATE", "mt5_account", {
        label: input.label,
        login: input.login,
        server: SERVER_LABELS[input.server as MT5Server] ?? input.server,
        active: !!input.makeActive,
        master: !!input.makeMaster,
      });
      return created;
    },
    [pushLog]
  );

  // ---- UPDATE ----
  const updateAccount = useCallback(
    (id: string, patch: Partial<Pick<MT5Account, "label" | "serverName" | "currency" | "leverage">>) => {
      let label = "";
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          label = a.label;
          return { ...a, ...patch, updatedAt: now() };
        })
      );
      pushLog("UPDATE", "mt5_account", { label, fields: Object.keys(patch) });
    },
    [pushLog]
  );

  // ---- DELETE ----
  const deleteAccount = useCallback(
    (id: string) => {
      let removed: MT5Account | undefined;
      setAccounts((prev) => {
        removed = prev.find((a) => a.id === id);
        return prev.filter((a) => a.id !== id);
      });
      if (removed) {
        pushLog("DELETE", "mt5_account", { label: removed.label, login: removed.login });
      }
    },
    [pushLog]
  );

  // ---- SET ACTIVE (single active invariant) ----
  const setActive = useCallback(
    (id: string) => {
      let label = "";
      setAccounts((prev) => {
        let found = false;
        const next = prev.map((a) => {
          if (a.id === id) {
            found = true;
            label = a.label;
            return { ...a, isActive: true };
          }
          return { ...a, isActive: false };
        });
        return found ? next : prev;
      });
      pushLog("MT5_ACTION", "mt5_account", { action: "set_active", label });
    },
    [pushLog]
  );

  // ---- SET MASTER (single master invariant) ----
  const setMaster = useCallback(
    (id: string) => {
      let label = "";
      setAccounts((prev) => {
        let found = false;
        const next = prev.map((a) => {
          if (a.id === id) {
            found = true;
            label = a.label;
            return { ...a, isMaster: true };
          }
          return { ...a, isMaster: false };
        });
        return found ? next : prev;
      });
      pushLog("MT5_ACTION", "mt5_account", { action: "set_master", label });
    },
    [pushLog]
  );

  // ---- CONNECT / DISCONNECT ----
  const toggleConnection = useCallback(
    (id: string, connect: boolean) => {
      let label = "";
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          label = a.label;
          return {
            ...a,
            isActiveConn: connect,
            lastConnectedAt: connect ? now() : a.lastConnectedAt,
            lastError: connect ? null : a.lastError,
            updatedAt: now(),
          };
        })
      );
      pushLog("MT5_ACTION", "mt5_account", { action: connect ? "connect" : "disconnect", label });
    },
    [pushLog]
  );

  return {
    accounts,
    logs,
    addAccount,
    updateAccount,
    deleteAccount,
    setActive,
    setMaster,
    toggleConnection,
    logLogin: (method: string) => pushLog("LOGIN", "admin", { method, device: "macOS · Chrome" }),
    logLogout: () => pushLog("LOGOUT", "admin", {}),
    log2FA: (enabled: boolean) =>
      pushLog(enabled ? "2FA_ENABLED" : "2FA_DISABLED", "admin", { method: "TOTP" }),
  };
}
