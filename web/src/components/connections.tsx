"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, LogOut, QrCode, RefreshCw } from "lucide-react";
import { zaloLogin, zaloLogout, zaloReconnect } from "@/app/actions";
import type { ZaloStatus } from "@/server/zalo";
import { PrimaryButton, useRun } from "./ui";

// Trạng thái Zalo: tải một lần rồi cập nhật mỗi khi server báo sự kiện "zalo".
export function useZaloStatus() {
  const [status, setStatus] = useState<ZaloStatus | null>(null);
  useEffect(() => {
    const load = () => fetch("/api/zalo").then((r) => r.json()).then(setStatus).catch(() => {});
    load();
    const es = new EventSource("/api/events");
    es.onmessage = (e) => { if (JSON.parse(e.data).type === "zalo") load(); };
    return () => es.close();
  }, []);
  return status;
}

export function Connections() {
  const status = useZaloStatus();
  const [pending, run] = useRun();

  return (
    <div className="no-scrollbar grid min-h-0 flex-1 auto-rows-min gap-4 overflow-y-auto lg:grid-cols-2">
      <section className="glass rounded-[32px] p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-sky-500 text-sm font-bold text-white">Zalo</span>
          <div>
            <h2 className="font-semibold">Zalo cá nhân</h2>
            <p className="text-xs text-slate-500">Nhận và trả lời tin nhắn 1-1 (không gồm nhóm)</p>
          </div>
        </div>

        <div className="mt-5">
          {!status && <Loader2 className="mx-auto size-6 animate-spin text-slate-400" />}

          {status?.state === "connected" && (
            <div className="tile flex items-center gap-3 rounded-[22px] p-4">
              {status.avatar
                // eslint-disable-next-line @next/next/no-img-element -- ảnh từ máy chủ Zalo
                ? <img src={status.avatar} alt="" referrerPolicy="no-referrer" className="size-12 rounded-full object-cover" />
                : <CheckCircle2 className="size-10 text-emerald-500" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"><span className="size-2 rounded-full bg-emerald-500" /> Đang kết nối</div>
                <div className="truncate font-semibold">{status.name}</div>
              </div>
              <button disabled={pending} onClick={() => confirm("Đăng xuất Zalo khỏi AI CRM?") && run(zaloLogout)}
                className="round-btn h-10 px-4 text-sm text-rose-600">
                <span className="flex items-center gap-1.5"><LogOut className="size-4" /> Đăng xuất</span>
              </button>
            </div>
          )}

          {status?.state === "qr" && (
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR dạng base64 */}
              <img src={status.qrImage} alt="Mã QR đăng nhập Zalo" className="mx-auto size-56 rounded-2xl bg-white p-2" />
              <p className="mt-3 text-sm">Mở Zalo trên điện thoại → <b>Quét mã QR</b> → quét mã này</p>
              <p className="mt-1 text-xs text-slate-500">Mã có hiệu lực khoảng 1 phút</p>
            </div>
          )}

          {status?.state === "scanned" && (
            <div className="py-6 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh từ máy chủ Zalo */}
              {status.avatar && <img src={status.avatar} alt="" referrerPolicy="no-referrer" className="mx-auto size-16 rounded-full" />}
              <p className="mt-3 font-semibold">{status.name}</p>
              <p className="text-sm text-slate-500">Bấm <b>Đăng nhập</b> trên điện thoại để xác nhận…</p>
            </div>
          )}

          {status?.state === "connecting" && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="size-5 animate-spin" /> Đang kết nối…
            </div>
          )}

          {status?.state === "disconnected" && (
            <div className="space-y-3">
              {status.reason && (
                <p className="flex gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {status.reason}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <PrimaryButton disabled={pending} onClick={() => run(zaloLogin)}>
                  <QrCode className="size-4" /> Đăng nhập bằng mã QR
                </PrimaryButton>
                {status.canReconnect && (
                  <button disabled={pending} onClick={() => run(zaloReconnect)} className="round-btn h-11 px-4 text-sm">
                    <span className="flex items-center gap-1.5"><RefreshCw className="size-4" /> Kết nối lại</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <ul className="mt-5 space-y-1.5 text-xs text-slate-500">
          <li>• Dùng thư viện không chính thức: có rủi ro bị khóa tài khoản. Nên thử bằng tài khoản phụ trước.</li>
          <li>• Chỉ một phiên Zalo Web chạy được cùng lúc: mở Zalo Web trên trình duyệt sẽ làm AI CRM bị ngắt.</li>
          <li>• Chỉ nhận tin khi AI CRM đang chạy trên máy.</li>
        </ul>
      </section>

      <section className="glass rounded-[32px] p-5 opacity-70 md:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-lg font-bold text-white">f</span>
          <div>
            <h2 className="font-semibold">Fanpage Facebook</h2>
            <p className="text-xs text-slate-500">Sẽ làm ở bước 4 (cần Cloudflare Tunnel)</p>
          </div>
        </div>
      </section>
    </div>
  );
}
