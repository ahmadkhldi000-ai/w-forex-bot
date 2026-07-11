"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  details?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  details,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4">
          <div
            className={
              destructive
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--danger)]/12"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/12"
            }
          >
            <AlertTriangle
              className={
                destructive
                  ? "h-5 w-5 text-[var(--danger)]"
                  : "h-5 w-5 text-[var(--gold-bright)]"
              }
            />
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              {message}
            </p>
          </div>
          <button
            onClick={() => !loading && onCancel()}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Optional details */}
        {details && (
          <div className="border-t border-[var(--border-subtle)] px-5 py-3">
            {details}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-5 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-smooth hover:bg-[var(--bg-hover)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={
              destructive
                ? "inline-flex items-center gap-2 rounded-xl bg-[var(--danger)] px-4 py-2 text-sm font-bold text-white transition-smooth hover:brightness-110 disabled:opacity-50"
                : "inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)] disabled:opacity-50"
            }
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
