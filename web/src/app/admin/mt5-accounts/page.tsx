"use client";

import { useState } from "react";
import {
  Plus,
  ShieldCheck,
  Zap,
  Crown,
  AlertTriangle,
  Lock,
  Server,
  RefreshCw,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { AccountCard } from "@/components/admin/account-card";
import { AddAccountDialog } from "@/components/admin/add-account-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useMt5Store } from "@/lib/admin/use-mt5-store";
import { type MT5Account } from "@/lib/admin/mt5-types";
import { formatMoney } from "@/lib/utils";

export default function Mt5AccountsPage() {
  const store = useMt5Store();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MT5Account | null>(null);
  const [masterTarget, setMasterTarget] = useState<MT5Account | null>(null);
  const [activeTarget, setActiveTarget] = useState<MT5Account | null>(null);

  const active = store.accounts.find((a) => a.isActive);
  const master = store.accounts.find((a) => a.isMaster);
  const connected = store.accounts.filter((a) => a.isActiveConn);
  const totalEquity = store.accounts.reduce((s, a) => s + a.equity, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="إدارة حسابات MT5" />
        <main className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-[var(--emerald)]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  حسابات MetaTrader 5
                </h2>
                <span className="rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                  {store.accounts.length} حسابات
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <Lock className="h-3.5 w-3.5 text-[var(--emerald)]" />
                قاعدة النظام: حساب واحد فقط{" "}
                <b className="text-[var(--emerald-bright)]">نشط</b> للتداول، وحساب
                واحد فقط{" "}
                <b className="text-[var(--gold-bright)]">رئيسي</b> لمصدر الـ
                Copy-Trading — يتم تطبيقها تلقائياً.
              </p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2.5 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)]"
            >
              <Plus className="h-4 w-4" />
              إضافة حساب
            </button>
          </div>

          {/* Summary tiles */}
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryTile
              icon={<Zap className="h-4 w-4" />}
              iconColor="text-[var(--emerald-bright)]"
              iconBg="bg-[var(--emerald)]/12"
              label="الحساب النشط"
              value={active ? active.label : "—"}
              sub={active ? `Login: ${active.login}` : "لا يوجد"}
            />
            <SummaryTile
              icon={<Crown className="h-4 w-4" />}
              iconColor="text-[var(--gold-bright)]"
              iconBg="bg-[var(--gold)]/12"
              label="الحساب الرئيسي"
              value={master ? master.label : "—"}
              sub={master ? "Copy-Trading Source" : "غير محدد"}
            />
            <SummaryTile
              icon={<Server className="h-4 w-4" />}
              iconColor="text-[var(--info)]"
              iconBg="bg-[var(--info)]/12"
              label="متصل"
              value={`${connected.length}/${store.accounts.length}`}
              sub="حسابات MT5"
            />
            <SummaryTile
              icon={<ShieldCheck className="h-4 w-4" />}
              iconColor="text-[var(--accent)]"
              iconBg="bg-[var(--accent)]/12"
              label="إجمالي السيولة"
              value={formatMoney(totalEquity, 0)}
              sub="USD"
            />
          </div>

          {/* Rule enforcement banner */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--emerald)]/15 bg-[var(--emerald)]/5 px-4 py-2.5 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--emerald)]" />
            <span>
              يتم فرض قواعد الحساب الواحد نشط والحساب الواحد رئيسي على مستوى قاعدة
              البيانات باستخدام المعاملات (Transactions). لا يمكن لأي عملية أن تكسر
              هذه القاعدة.
            </span>
          </div>

          {/* Account grid */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {store.accounts.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-[var(--border-strong)] py-16 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  لا توجد حسابات مسجّلة بعد
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)]"
                >
                  <Plus className="h-4 w-4" />
                  إضافة أول حساب
                </button>
              </div>
            ) : (
              store.accounts.map((a) => (
                <AccountCard
                  key={a.id}
                  account={a}
                  onActivate={(id) => {
                    const acc = store.accounts.find((x) => x.id === id);
                    if (acc && !acc.isActive) setActiveTarget(acc);
                  }}
                  onSetMaster={(id) => {
                    const acc = store.accounts.find((x) => x.id === id);
                    if (acc && !acc.isMaster) setMasterTarget(acc);
                  }}
                  onToggleConn={store.toggleConnection}
                  onDelete={(id) => {
                    const acc = store.accounts.find((x) => x.id === id);
                    if (acc) setDeleteTarget(acc);
                  }}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Add Account Dialog */}
      <AddAccountDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(input) => {
          store.addAccount(input);
          setShowAdd(false);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف حساب MT5"
        message={`هل أنت متأكد من حذف الحساب "${deleteTarget?.label}" (Login: ${deleteTarget?.login})؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        cancelLabel="إلغاء"
        destructive
        details={
          deleteTarget && (
            <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
              {deleteTarget.isActive && (
                <div className="flex items-center gap-2 rounded-lg bg-[var(--danger)]/8 px-3 py-2 text-[var(--danger)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    هذا هو الحساب النشط حالياً — سيتم إيقاف التداول فوراً بعد الحذف.
                  </span>
                </div>
              )}
              {deleteTarget.isMaster && (
                <div className="flex items-center gap-2 rounded-lg bg-[var(--gold)]/8 px-3 py-2 text-[var(--gold-bright)]">
                  <Crown className="h-3.5 w-3.5" />
                  <span>
                    هذا هو الحساب الرئيسي — سيتم إيقاف Copy-Trading بعد الحذف.
                  </span>
                </div>
              )}
              <div className="flex justify-between px-3 pt-1">
                <span>الرصيد:</span>
                <span className="font-mono-nums text-[var(--text-secondary)]">
                  {formatMoney(deleteTarget.balance)}
                </span>
              </div>
              <div className="flex justify-between px-3">
                <span>الخادم:</span>
                <span className="text-[var(--text-secondary)]">
                  {deleteTarget.serverName ?? "—"}
                </span>
              </div>
            </div>
          )
        }
        onConfirm={() => {
          if (deleteTarget) store.deleteAccount(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Activate Confirmation */}
      <ConfirmDialog
        open={!!activeTarget}
        title="تنشيط حساب للتداول"
        message={`سيتم تنشيط الحساب "${activeTarget?.label}" كحساب التداول النشط. سيتم إلغاء تنشيط أي حساب نشط آخر تلقائياً.`}
        confirmLabel="تنشيط"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (activeTarget) store.setActive(activeTarget.id);
          setActiveTarget(null);
        }}
        onCancel={() => setActiveTarget(null)}
      />

      {/* Master Change Confirmation */}
      <ConfirmDialog
        open={!!masterTarget}
        title="تغيير الحساب الرئيسي"
        message={`سيتم تعيين الحساب "${masterTarget?.label}" كحساب رئيسي لمصدر Copy-Trading. سيتم إلغاء تعيين الحساب الرئيسي الحالي تلقائياً.`}
        confirmLabel="تعيين كرئيسي"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (masterTarget) store.setMaster(masterTarget.id);
          setMasterTarget(null);
        }}
        onCancel={() => setMasterTarget(null)}
      />
    </div>
  );
}

/* ---------- Summary Tile ---------- */
function SummaryTile({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <span className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
          {label}
        </span>
      </div>
      <p className="mt-2 truncate text-sm font-bold text-[var(--text-primary)]" title={value}>
        {value}
      </p>
      <p className="font-mono-nums text-[10px] text-[var(--text-muted)]">{sub}</p>
    </div>
  );
}
