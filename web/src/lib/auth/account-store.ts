/**
 * Local account store — persists registered accounts in the browser
 * so users can sign in with email + password without a live backend.
 *
 * Each account is stored under `wfb_account_<email>` and a separate
 * `wfb_accounts_index` keeps the list of emails. Passwords are hashed
 * with a salted SHA-256 (client-side demo only — a real backend would
 * use bcrypt server-side).
 *
 * Google accounts are also stored here: when a user signs in with Google,
 * their profile is saved with `provider: GOOGLE` and no password.
 */

import type { GoogleProfile } from "@/lib/auth/google-gsi";

export type AccountProvider = "LOCAL" | "GOOGLE";

export interface StoredAccount {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: AccountProvider;
  /** Base64 salted SHA-256 hash. Absent for Google-only accounts. */
  passwordHash?: string;
  riskAccepted: boolean;
  riskAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const INDEX_KEY = "wfb_accounts_index";
const SESSION_KEY = "wfb_session";

function readIndex(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeIndex(emails: string[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(emails));
}

function keyFor(email: string) {
  return `wfb_account_${email.toLowerCase().trim()}`;
}

/** Hash a password with a random salt using SubtleCrypto (SHA-256). */
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder().encode(password + toHex(salt));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return toHex(salt) + ":" + toHex(new Uint8Array(buf));
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  const enc = new TextEncoder().encode(password + saltHex);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return toHex(new Uint8Array(buf)) === hashHex;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function genId(): string {
  return (
    "u_" +
    Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function findAccount(email: string): StoredAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyFor(email));
    return raw ? (JSON.parse(raw) as StoredAccount) : null;
  } catch {
    return null;
  }
}

export function saveAccount(account: StoredAccount) {
  localStorage.setItem(keyFor(account.email), JSON.stringify(account));
  const idx = readIndex();
  if (!idx.includes(account.email.toLowerCase())) {
    idx.push(account.email.toLowerCase());
    writeIndex(idx);
  }
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  riskAccepted: boolean;
}

export async function registerAccount(
  input: RegisterInput
): Promise<{ ok: true; account: StoredAccount } | { ok: false; error: string }> {
  if (findAccount(input.email)) {
    return { ok: false, error: "هذا البريد مسجّل مسبقاً" };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
  }
  const now = new Date().toISOString();
  const account: StoredAccount = {
    id: genId(),
    email: input.email.toLowerCase().trim(),
    name: input.name?.trim() || input.email.split("@")[0],
    passwordHash: await hashPassword(input.password),
    provider: "LOCAL",
    riskAccepted: input.riskAccepted,
    riskAcceptedAt: input.riskAccepted ? now : undefined,
    createdAt: now,
    updatedAt: now,
  };
  saveAccount(account);
  return { ok: true, account };
}

export async function loginAccount(
  email: string,
  password: string
): Promise<{ ok: true; account: StoredAccount } | { ok: false; error: string }> {
  const account = findAccount(email);
  if (!account || !account.passwordHash) {
    return { ok: false, error: "بيانات الدخول غير صحيحة" };
  }
  if (!(await verifyPassword(password, account.passwordHash))) {
    return { ok: false, error: "بيانات الدخول غير صحيحة" };
  }
  return { ok: true, account };
}

/**
 * Upsert a Google account. If the email already has a LOCAL account,
 * link Google to it (merge). Returns whether this was a first-time link.
 */
export function upsertGoogleAccount(profile: GoogleProfile): {
  account: StoredAccount;
  firstLogin: boolean;
} {
  const existing = findAccount(profile.email);
  const now = new Date().toISOString();

  if (existing) {
    const merged: StoredAccount = {
      ...existing,
      name: existing.name || profile.name,
      avatarUrl: existing.avatarUrl || profile.picture,
      provider: "GOOGLE",
      updatedAt: now,
    };
    saveAccount(merged);
    return { account: merged, firstLogin: false };
  }

  const account: StoredAccount = {
    id: genId(),
    email: profile.email.toLowerCase(),
    name: profile.name,
    avatarUrl: profile.picture,
    provider: "GOOGLE",
    riskAccepted: false,
    createdAt: now,
    updatedAt: now,
  };
  saveAccount(account);
  return { account, firstLogin: true };
}

// --- Session (current logged-in user) ---

export interface Session {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: AccountProvider;
  role: string;
  riskAccepted: boolean;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(account: StoredAccount): Session {
  const session: Session = {
    id: account.id,
    email: account.email,
    name: account.name,
    avatarUrl: account.avatarUrl,
    provider: account.provider,
    role: "USER",
    riskAccepted: account.riskAccepted,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

/** Link an email + password to an existing Google account (after Google sign-in). */
export async function linkEmailAndPassword(
  googleEmail: string,
  password: string,
  riskAccepted: boolean
): Promise<{ ok: true; account: StoredAccount } | { ok: false; error: string }> {
  const account = findAccount(googleEmail);
  if (!account) {
    return { ok: false, error: "حساب جوجل غير موجود" };
  }
  if (password.length < 8) {
    return { ok: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
  }
  const now = new Date().toISOString();
  const updated: StoredAccount = {
    ...account,
    passwordHash: await hashPassword(password),
    riskAccepted,
    riskAcceptedAt: riskAccepted ? now : account.riskAcceptedAt,
    updatedAt: now,
  };
  saveAccount(updated);
  return { ok: true, account: updated };
}
