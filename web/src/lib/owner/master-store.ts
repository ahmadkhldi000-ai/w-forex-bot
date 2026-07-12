"use client";

/**
 * ===================================================================
 *  OWNER-PRIVATE MT5 MASTER ACCOUNT STORE
 * ===================================================================
 *  Stores the OWNER's MT5 master login + password + server so the
 *  bot can open trades on the owner's real account.
 *
 *  SECURITY MODEL:
 *  - This module is ONLY reachable through the hidden `/owner` route,
 *    gated by a secret passcode (OWNER_PASSCODE).
 *  - The passcode is NOT stored anywhere in the UI. It is compared
 *    against a constant compiled into the bundle.
 *  - Credentials are XOR-encrypted with a derived key before being
 *    persisted to localStorage (obfuscation for at-rest data on the
 *    owner's own machine — a production system would use the backend
 *    + hardware security; this is the client-side bridge equivalent).
 *  - No regular user, admin viewer, or bot traffic ever loads this data.
 * ===================================================================
 */

// ------------------------------------------------------------------
//  OWNER PASSCODE
//  Change this to your own secret value before deploying.
//  It is compared in-memory; never written to storage or logs.
// ------------------------------------------------------------------
export const OWNER_PASSCODE =
  process.env.NEXT_PUBLIC_OWNER_PASSCODE ?? "W-OWNER-2026-KHALDI";

// The owner's email whitelist (only these emails may use the gate).
// Leave empty array [] to rely solely on the passcode.
export const OWNER_EMAILS = ["ahmad@wforexbot.com", "owner@wforexbot.com"];

// ------------------------------------------------------------------
//  Types
// ------------------------------------------------------------------
export interface MasterAccount {
  label: string;
  login: string;            // MT5 login number
  server: string;           // e.g. "ICMarketsSC-Live21"
  password: string;         // investor OR master password
  currency: string;         // USD / EUR ...
  leverage: number;
  /** The MT5 bridge connection state. */
  connection: "disconnected" | "connecting" | "connected" | "error";
  lastConnectedAt?: string;
  lastError?: string | null;
  /** When the master was first registered. */
  createdAt: string;
  updatedAt: string;
}

export interface OwnerSession {
  unlockedAt: string;       // ISO timestamp of unlock
  expiresAt: string;        // ISO timestamp — session auto-expires
}

// ------------------------------------------------------------------
//  Storage keys (namespaced & obscure)
// ------------------------------------------------------------------
const LS_MASTER = "wfb_omx_master_v1";
const LS_SESSION = "wfb_omx_session_v1";

// ------------------------------------------------------------------
//  Lightweight at-rest obfuscation (XOR + base64).
//  Not cryptographic-grade; the real secret is the passcode gate.
// ------------------------------------------------------------------
function deriveKey(): string {
  // Stable per-deploy key derived from the passcode + a salt constant.
  return OWNER_PASSCODE + "::wfb-omx-salt::v1";
}

function xorCipher(text: string, key: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return out;
}

function encrypt(plain: string): string {
  if (typeof window === "undefined") return plain;
  try {
    return btoa(unescape(encodeURIComponent(xorCipher(plain, deriveKey()))));
  } catch {
    return plain;
  }
}

function decrypt(cipher: string): string {
  if (typeof window === "undefined") return cipher;
  try {
    return xorCipher(decodeURIComponent(escape(atob(cipher))), deriveKey());
  } catch {
    return cipher;
  }
}

// ------------------------------------------------------------------
//  Owner session (passcode gate)
// ------------------------------------------------------------------
const SESSION_TTL_MS = 1000 * 60 * 30; // 30 minutes

export function getOwnerSession(): OwnerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LS_SESSION);
    if (!raw) return null;
    const s = JSON.parse(raw) as OwnerSession;
    if (new Date(s.expiresAt).getTime() < Date.now()) {
      sessionStorage.removeItem(LS_SESSION);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function isOwnerUnlocked(): boolean {
  return getOwnerSession() !== null;
}

/** Validate the passcode. Returns true and creates a session if valid. */
export function unlockOwner(passcode: string): boolean {
  // constant-time-ish compare
  const a = passcode;
  const b = OWNER_PASSCODE;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  if (diff !== 0) return false;

  const now = Date.now();
  const session: OwnerSession = {
    unlockedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };
  try {
    sessionStorage.setItem(LS_SESSION, JSON.stringify(session));
  } catch {
    /* ignore */
  }
  return true;
}

export function lockOwner(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LS_SESSION);
}

export function renewOwnerSession(): void {
  const s = getOwnerSession();
  if (!s) return;
  const now = Date.now();
  s.expiresAt = new Date(now + SESSION_TTL_MS).toISOString();
  try {
    sessionStorage.setItem(LS_SESSION, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

// ------------------------------------------------------------------
//  Master account CRUD
// ------------------------------------------------------------------
export function getMasterAccount(): MasterAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_MASTER);
    if (!raw) return null;
    const json = decrypt(raw);
    return JSON.parse(json) as MasterAccount;
  } catch {
    return null;
  }
}

export function saveMasterAccount(input: Omit<MasterAccount, "createdAt" | "updatedAt" | "connection" | "lastConnectedAt" | "lastError"> & {
  connection?: MasterAccount["connection"];
}): MasterAccount {
  const existing = getMasterAccount();
  const now = new Date().toISOString();
  const account: MasterAccount = {
    label: input.label,
    login: input.login,
    server: input.server,
    password: input.password,
    currency: input.currency || "USD",
    leverage: input.leverage || 100,
    connection: input.connection ?? "disconnected",
    lastConnectedAt: existing?.lastConnectedAt,
    lastError: existing?.lastError ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  try {
    localStorage.setItem(LS_MASTER, encrypt(JSON.stringify(account)));
  } catch {
    /* ignore */
  }
  return account;
}

export function updateMasterConnection(
  connection: MasterAccount["connection"],
  error?: string | null
): MasterAccount | null {
  const existing = getMasterAccount();
  if (!existing) return null;
  const updated: MasterAccount = {
    ...existing,
    connection,
    lastError: error ?? null,
    lastConnectedAt:
      connection === "connected"
        ? new Date().toISOString()
        : existing.lastConnectedAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(LS_MASTER, encrypt(JSON.stringify(updated)));
  } catch {
    /* ignore */
  }
  return updated;
}

export function deleteMasterAccount(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_MASTER);
}
