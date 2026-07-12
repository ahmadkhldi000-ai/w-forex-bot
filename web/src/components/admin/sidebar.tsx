"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Repeat,
  Bot,
  Settings,
  FileText,
  BarChart3,
  ScrollText,
  LogOut,
  ChevronLeft,
  Server,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { label: "نظرة عامة", href: "/admin", icon: LayoutDashboard },
  { label: "المستخدمون", href: "/admin/users", icon: Users },
  { label: "الاشتراكات", href: "/admin/subscriptions", icon: Repeat },
  { label: "المدفوعات", href: "/admin/payments", icon: CreditCard },
  { label: "حسابات MT5", href: "/admin/mt5-accounts", icon: Server },
  { label: "البوت & MT5", href: "/admin/bot", icon: Bot },
  { label: "التقارير", href: "/admin/reports", icon: BarChart3 },
  { label: "سجلّات النشاط", href: "/admin/logs", icon: ScrollText },
  { label: "الأمان", href: "/admin/security", icon: Lock },
  { label: "الإعدادات", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--border-subtle)] px-5">
        {!collapsed ? (
          <Logo height={30} priority />
        ) : (
          <Logo variant="icon" height={32} priority />
        )}
        {!collapsed && (
          <span className="mr-auto rounded-md bg-[var(--gold)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--gold-bright)]">
            ADMIN
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-smooth ${
                active
                  ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 ${active ? "text-[var(--accent-bright)]" : ""}`}
              />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border-subtle)] p-3">
        <Link
          href="/admin/auth/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] transition-smooth hover:bg-[var(--danger-dim)] hover:text-[var(--danger)]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-[var(--text-muted)] transition-smooth hover:text-[var(--text-secondary)]"
        >
          <ChevronLeft
            className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
          {!collapsed && <span>طيّ القائمة</span>}
        </button>
      </div>
    </aside>
  );
}
