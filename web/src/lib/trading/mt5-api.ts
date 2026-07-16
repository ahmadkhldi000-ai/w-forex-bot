"use client";

import { API_URL, getToken } from "@/lib/auth/config";

/* ====================================================================
   MT5 API Client
   --------------------------------------------------------------------
   Talks to the Express backend (/api/management/mt5/*) to register,
   connect, and manage MT5 accounts. Falls back gracefully when the
   backend is unreachable (offline / no VPS) by keeping a local copy
   via the master-store so the UI still works.
   ==================================================================== */

export interface MT5AccountDTO {
  id: string;
  label: string;
  login: string;
  serverName?: string;
  broker?: string;
  currency: string;
  leverage: number;
  isActive: boolean;
  isActiveConn: boolean;
  isMaster: boolean;
  balance: number;
  equity: number;
  lastConnectedAt?: string | null;
  lastError?: string | null;
}

const BASE = `${API_URL}/api/management/mt5`;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Check whether the backend is reachable (used to decide online vs
 * offline mode). Timeout after 3s so the UI never hangs.
 */
export async function pingBackend(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`${API_URL}/health`, {
      signal: ctrl.signal,
      headers: authHeaders(),
    });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

/** List the current user's MT5 accounts. */
export async function listAccounts(): Promise<MT5AccountDTO[]> {
  const res = await fetch(`${BASE}/accounts`, { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await safeErr(res));
  const json = await res.json();
  return json.data ?? json ?? [];
}

/** Create (register) a new MT5 account. Returns the created record. */
export async function createAccount(input: {
  label: string;
  login: string;
  server: string;
  password: string;
  currency: string;
  leverage: number;
  makeMaster?: boolean;
}): Promise<MT5AccountDTO> {
  const res = await fetch(`${BASE}/accounts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(res.status, await safeErr(res));
  const json = await res.json();
  return json.data ?? json;
}

/** Update an existing account. */
export async function updateAccount(
  id: string,
  input: Partial<{
    label: string;
    serverName: string;
    password: string;
    currency: string;
    leverage: number;
  }>
): Promise<MT5AccountDTO> {
  const res = await fetch(`${BASE}/accounts/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(res.status, await safeErr(res));
  const json = await res.json();
  return json.data ?? json;
}

/** Tell the bridge to connect (or disconnect) the account. */
export async function toggleConnection(
  id: string,
  connect: boolean
): Promise<MT5AccountDTO> {
  const res = await fetch(`${BASE}/accounts/${id}/connect`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ connect }),
  });
  if (!res.ok) throw new ApiError(res.status, await safeErr(res));
  const json = await res.json();
  return json.data ?? json;
}

/** Delete an account. */
export async function deleteAccount(id: string): Promise<void> {
  const res = await fetch(`${BASE}/accounts/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new ApiError(res.status, await safeErr(res));
}

/* ── helpers ── */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function safeErr(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return j.error?.message ?? j.error ?? j.message ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}
