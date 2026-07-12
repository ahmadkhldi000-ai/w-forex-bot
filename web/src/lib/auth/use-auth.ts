"use client";

/**
 * useAuth — React hook that exposes the current session + trading profile
 * and guards protected routes.
 *
 * Usage:
 *   const { user, loading, profile, stats, requireAuth } = useAuth();
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  type Session,
  clearSession,
} from "@/lib/auth/account-store";
import {
  getTradingProfile,
  getStats,
  type TradingProfile,
  type TradingStats,
} from "@/lib/trading/profile";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [profile, setProfile] = useState<TradingProfile | null>(null);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const session = getSession();
    if (session) {
      const p = getTradingProfile(session.email);
      setProfile(p);
      setStats(getStats(p));
    } else {
      setProfile(null);
      setStats(null);
    }
    setUser(session);
    setLoading(false);
    return session;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Redirect to /auth if not logged in. Call in protected pages. */
  const requireAuth = useCallback(() => {
    const session = refresh();
    if (!session) {
      router.replace("/auth");
      return false;
    }
    return true;
  }, [refresh, router]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setProfile(null);
    setStats(null);
    router.push("/auth");
  }, [router]);

  return { user, profile, stats, loading, refresh, requireAuth, logout };
}
