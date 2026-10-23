"use client";

import { CalendarClock, Plus } from "lucide-react";
import { formatFollowUp } from "@/lib/format";
import { STAGES, type ContactDTO, type ProductDTO } from "@/lib/types";
import { Avatar } from "./ui";

/* Hành trình khách hàng (giống bảng Customer Journeys) */
export function Pipeline({ contacts, products, onOpen, onNewContact }: {
  contacts: ContactDTO[]; products: ProductDTO[]; onOpen: (id: string) => void; onNewContact: () => void;
}) {
  const productName = (id?: string) => products.find((p) => p.id === id)?.name ?? "Chưa gắn sản phẩm";
  const followUps = contacts
    .filter((c) => c.followUpAt && c.stage !== "da_chot" && c.stage !== "khong_mua")
    .sort((a, b) => a.followUpAt!.localeCompare(b.followUpAt!));

  return (
    <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto">
      <section className="glass rounded-[32px] p-4 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-lg font-semibold">Khách đang theo dõi</h2>
          <div className="ml-2 hidden -space-x-2 sm:flex">
            {contacts.slice(0, 6).map((c) => <Avatar key={c.id} name={c.name} hue={c.hue} className="size-9 text-xs ring-2 ring-white" />)}
          </div>
          <button onClick={onNewContact} className="round-btn ml-auto size-11" aria-label="Thêm khách"><Plus className="size-5" /></button>
        </div>
        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-2 xl:grid-cols-4">
          {STAGES.filter((s) => s.id !== "khong_mua").map((s) => {
            const items = contacts.filter((c) => c.stage === s.id);
            return (
              <div key={s.id} className="flex w-[80%] shrink-0 snap-start flex-col md:w-auto">
                <div className="flex min-h-[220px] flex-1 flex-col gap-2 rounded-[26px] bg-white/55 p-3">
                  {items.map((c) => (
                    <button key={c.id} onClick={() => onOpen(c.id)}
                      className="tile flex items-center gap-3 rounded-[20px] p-3 text-left hover:bg-white">
                      <Avatar name={c.name} hue={c.hue} channel={c.channel} className="size-10" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{c.name}</div>
                        <div className="truncate text-xs text-slate-500">{productName(c.productIds[0])}</div>
                      </div>
                      {c.followUpAt && <CalendarClock className="size-4 shrink-0 text-rose-500" />}
                    </button>
                  ))}
                  {items.length === 0 && <div className="m-auto text-xs text-slate-400">Trống</div>}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                  {s.label}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.tone}`}>{items.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass rounded-[32px] p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold">Lịch follow-up</h2>
        {followUps.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có lịch nhắc nào.</p>
        ) : (
          <ul className="space-y-2">
            {followUps.map((c) => {
              const overdue = c.followUpAt! < new Date().toISOString();
              return (
                <li key={c.id}>
                  <button onClick={() => onOpen(c.id)} className="tile flex w-full items-center gap-3 rounded-[20px] p-3 text-left hover:bg-white">
                    <Avatar name={c.name} hue={c.hue} channel={c.channel} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{c.name}</div>
                      <div className="truncate text-xs text-slate-500">{c.note ?? productName(c.productIds[0])}</div>
                    </div>
                    <span className={`shrink-0 text-xs font-medium ${overdue ? "text-rose-600" : "text-slate-600"}`}>
                      {formatFollowUp(c.followUpAt!)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export function Reports({ contacts }: { contacts: ContactDTO[] }) {
  const total = Math.max(contacts.length, 1);
  const counts = STAGES.map((s) => ({ ...s, n: contacts.filter((c) => c.stage === s.id).length }));
  const closed = counts.find((c) => c.id === "da_chot")!.n;
  const rate = Math.round((closed / total) * 100);
  const fb = contacts.filter((c) => c.channel === "facebook").length;
  return (
    <div className="no-scrollbar grid min-h-0 flex-1 auto-rows-min gap-4 overflow-y-auto md:grid-cols-2">
      <section className="glass rounded-[32px] p-6">
        <h2 className="font-semibold">Tỷ lệ chốt đơn</h2>
        <div className="relative mx-auto mt-4 size-44">
          <svg viewBox="0 0 36 36" className="size-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeOpacity=".7" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5484d" strokeWidth="3.5"
              strokeDasharray={`${rate} 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-3xl font-bold">{rate}%</div>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">{closed}/{contacts.length} khách đã chốt</p>
      </section>
      <section className="glass rounded-[32px] p-6">
        <h2 className="font-semibold">Theo trạng thái</h2>
        <div className="mt-4 space-y-3">
          {counts.map((c) => (
            <div key={c.id}>
              <div className="mb-1 flex justify-between text-xs"><span>{c.label}</span><span>{c.n}</span></div>
              <div className="h-2.5 rounded-full bg-white/70">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${(c.n / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="glass rounded-[32px] p-6 md:col-span-2">
        <h2 className="font-semibold">Theo kênh</h2>
        <div className="mt-4 flex gap-3">
          <div className="tile flex-1 rounded-[22px] p-4"><div className="text-xs text-slate-500">Facebook</div><div className="text-3xl font-bold text-blue-600">{fb}</div></div>
          <div className="tile flex-1 rounded-[22px] p-4"><div className="text-xs text-slate-500">Zalo</div><div className="text-3xl font-bold text-sky-500">{contacts.length - fb}</div></div>
        </div>
      </section>
    </div>
  );
}
