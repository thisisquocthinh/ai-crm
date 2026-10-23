"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";
import type { ActionResult } from "@/app/actions";
import { initials } from "@/lib/format";
import type { Channel } from "@/lib/types";

// Chạy một server action, báo lỗi nếu có, gọi onOk khi thành công.
export function useRun() {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>, onOk?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) onOk?.();
      else alert(r.error);
    });
  return [pending, run] as const;
}

export function Avatar({ name, hue, channel, src, className = "" }: {
  name: string; hue: number; channel?: Channel; src?: string | null; className?: string;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={`relative inline-grid shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${hue + 30} 65% 45%))` }}>
      {src && !broken
        // eslint-disable-next-line @next/next/no-img-element -- ảnh từ máy chủ Zalo, không qua tối ưu ảnh của Next
        ? <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="absolute inset-0 size-full rounded-full object-cover" />
        : initials(name)}
      {channel && (
        <span className={`absolute -bottom-0.5 -right-0.5 grid size-[18px] place-items-center rounded-full text-[8px] font-bold ring-2 ring-white ${
          channel === "facebook" ? "bg-blue-600" : "bg-sky-500"}`}>
          {channel === "facebook" ? "f" : "Z"}
        </span>
      )}
    </span>
  );
}

// Hộp thoại: giữa màn hình trên màn rộng, trượt từ dưới lên trên màn ngoài.
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/25 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-[28px] bg-[#eef1f6] p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-2xl sm:max-w-md sm:rounded-[28px] sm:pb-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="round-btn ml-auto size-9" aria-label="Đóng"><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block px-1 text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = "tile w-full rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400";

export function PrimaryButton({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest}
      className={`flex h-11 items-center justify-center gap-1.5 rounded-full bg-black px-5 text-sm font-medium text-white disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}
