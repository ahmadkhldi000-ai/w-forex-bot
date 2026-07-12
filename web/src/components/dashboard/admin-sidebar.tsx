"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Server,
  ShieldCheck,
  ScrollText,
  ChevronLeft,
  LogOut,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { SmartLogo } from "@/components/ui/smart-logo";

export type AdminTab = "overview" | "accounts" | "security" | "logs";

const nav: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "accounts", label: "حسابات MT5", icon: Server },
  { id: "security", label: "الأمان", icon: ShieldCheck },
  { id: "logs", label: "سجلّ النشاط", icon: ScrollText },
];

interface Props {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  /** badge counts */
  accountsCount: number;
  logsCount: number;
  twoFAEnabled: boolean;
}

export function AdminSidebar({
  active,
  onChange,
  accountsCount,
  logsCount,
  twoFAEnabled,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const badgeFor = (id: AdminTab): string | null => {
    if (id === "accounts" && accountsCount > 0) return String(accountsCount);
    if (id === "logs" && logsCount > 0) return String(logsCount);
    return null;
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-300",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      {/* Brand */}
      <div className="flex h-[68px] items-center gap-3 border-b border-[var(--border-subtle)] px-5">
        {!collapsed && <SmartLogo height={30} priority />}
        {collapsed && <SmartLogo variant="icon" height={32} priority />}
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[var(--text-muted)]">
              Master Account System
            </p>
          </div>
        )}
      </div>

      {/* Admin identity */}
      <div className="mx-3 mt-4 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-dim)] p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-bright)] to-[var(--accent)] text-xs font-bold text-[#04130d]">
            AK
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                Ahmad Khaldi
              </p>
              <p className="flex items-center gap-1 truncate text-[10px] text-[var(--accent-bright)]">
                <ShieldCheck className="h-3 w-3" />
                {twoFAEnabled ? "2FA مُفعّل" : "2FA معطّل"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p
          className={cn(
            "px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]",
            collapsed && "text-center",
          )}
        >
          {collapsed ? "•" : "الإدارة"}
        </p>
        {nav.map((item) => {
          const isActive = active === item.id;
          const badge = badgeFor(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-smooth",
                isActive
                  ? "bg-[var(--accent-dim)] font-semibold text-[var(--accent-bright)]"
                  : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-secondary)]",
                collapsed && "justify-center",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                  isActive && "text-[var(--accent-bright)]",
                )}
                strokeWidth={isActive ? 2.4 : 2}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 text-right">{item.label}</span>
                  {badge && (
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                        isActive
                          ? "bg-[var(--accent)] text-[#04130d]"
                          : "bg-white/10 text-[var(--text-muted)]",
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border-subtle)] p-3">
        <a
          href="/admin/auth/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] transition-smooth hover:bg-[var(--danger-dim)] hover:text-[var(--danger)]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </a>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] transition-smooth hover:bg-white/5"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed && <span>طيّ القائمة</span>}
        </button>
      </div>
    </aside>
  );
}
