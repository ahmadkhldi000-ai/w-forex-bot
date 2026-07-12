/**
 * Auth configuration & helpers for WForexBot.
 *
 * The backend (Express) serves auth under /api/auth/*.
 * Configure its URL with NEXT_PUBLIC_API_URL (e.g. https://api.wforexbot.com).
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

/** Full URL of the Google sign-in endpoint on the backend. */
export const GOOGLE_AUTH_URL = `${API_URL}/api/auth/google`;

/** Token storage keys (kept in sync between localStorage + cookie). */
export const TOKEN_KEY = "wfb_token";
export const USER_KEY = "wfb_user";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  riskAccepted?: boolean;
  avatarUrl?: string | null;
}

/** Read the stored JWT (client-side only). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist the JWT in localStorage + a cookie (so SSR/middleware can read it). */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // Cookie readable by middleware; HttpOnly not possible from JS, but value is also in localStorage.
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Clear all auth state (logout). */
export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

/** Decode a JWT payload without verifying (for reading user info client-side). */
export function decodeJwt<T = AuthUser>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
