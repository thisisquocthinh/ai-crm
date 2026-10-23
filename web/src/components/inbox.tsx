"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  CalendarClock, CheckCheck, ChevronLeft, Info, MessageCircle, Phone, Plus, Search, Send, Sparkles, Trash2, X,
} from "lucide-react";
import {
  createContact, deleteContact, sendMessage, setInterest, updateContact,
} from "@/app/actions";
import { formatFollowUp, formatListTime, formatTime, fromLocalInput, toLocalInput, vnd } from "@/lib/format";
import { templateSuggestions } from "@/lib/suggest";
import { STAGES, type Channel, type ContactDTO, type MessageDTO, type ProductDTO } from "@/lib/types";
import { Avatar, Field, Modal, PrimaryButton, inputCls, useRun } from "./ui";

type Filter = "all" | Channel | "unread";

export function Inbox({ contacts, products, selectedId, onOpen, onBack, onNewContact }: {
  contacts: ContactDTO[];
  products: ProductDTO[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  onBack: () => void;
  onNewContact: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const selected = contacts.find((c) => c.id === selectedId) ?? null;

  const list = useMemo(() => contacts.filter((c) =>
    (filter === "all" || (filter === "unread" ? c.unread > 0 : c.channel === filter)) &&
    (c.name + " " + (c.phone ?? "")).toLowerCase().includes(q.toLowerCase())), [contacts, filter, q]);

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      {/* Danh sách: luôn hiện từ md; trên màn ngoài chỉ hiện khi chưa chọn */}
      <section className={`glass min-h-0 min-w-0 flex-col rounded-[28px] p-3 md:flex md:w-[300px] md:shrink-0 lg:w-[340px] ${
        selected ? "hidden" : "flex flex-1"}`}>
        <div className="flex gap-2">
          <div className="tile flex flex-1 items-center gap-2 rounded-full px-4 py-2.5">
            <Search className="size-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên, SĐT…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <button onClick={onNewContact} className="round-btn size-11 shrink-0" aria-label="Thêm khách"><Plus className="size-5" /></button>
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {([["all", "Tất cả"], ["unread", "Chưa đọc"], ["facebook", "Facebook"], ["zalo", "Zalo"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${
                filter === id ? "bg-black text-white" : "bg-white/60 text-slate-600"}`}>{label}</button>
          ))}
        </div>
        <ul className="no-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
          {list.map((c) => {
            const last = c.messages.at(-1);
            const active = c.id === selectedId;
            return (
              <li key={c.id}>
                <button onClick={() => onOpen(c.id)}
                  className={`flex w-full items-center gap-3 rounded-[22px] p-3 text-left transition ${
                    active ? "bg-black text-white" : "tile hover:bg-white"}`}>
                  <Avatar name={c.name} hue={c.hue} channel={c.channel} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{c.name}</span>
                      <span className={`ml-auto shrink-0 text-[11px] ${active ? "text-white/60" : "text-slate-400"}`}>{formatListTime(c.lastMessageAt)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className={`truncate text-xs ${active ? "text-white/70" : c.unread ? "font-medium text-slate-800" : "text-slate-500"}`}>
                        {last ? (last.direction === "out" ? "Bạn: " : "") + last.text : "Chưa có tin nhắn"}
                      </span>
                      {c.unread > 0 && (
                        <span className="ml-auto grid size-5 shrink-0 place-items-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">{c.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="py-10 text-center text-sm text-slate-500">Không có hội thoại</li>}
        </ul>
      </section>

      {selected ? (
        <Chat key={selected.id} contact={selected} products={products} onBack={onBack} onInfo={() => setShowInfo(true)} />
      ) : (
        <section className="glass hidden flex-1 place-items-center rounded-[28px] md:grid">
          <div className="text-center text-slate-500">
            <MessageCircle className="mx-auto size-10 text-slate-400" />
            <p className="mt-3 text-sm">Chọn một hội thoại để bắt đầu</p>
          </div>
        </section>
      )}

      {/* Thông tin khách: cột riêng trên màn rộng, bảng trượt trên màn nhỏ */}
      {selected && (
        <aside className="no-scrollbar hidden w-[300px] shrink-0 overflow-y-auto xl:block">
          <CustomerPanel key={selected.id} contact={selected} products={products} onDeleted={onBack} />
        </aside>
      )}
      {selected && showInfo && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/20 backdrop-blur-sm xl:hidden" onClick={() => setShowInfo(false)}>
          <div className="h-full w-full max-w-[380px] overflow-y-auto bg-[#e4e8f0] p-3 pt-[calc(env(safe-area-inset-top)+12px)]" onClick={(e) => e.stopPropagation()}>
            <button className="round-btn mb-3 ml-auto size-10" onClick={() => setShowInfo(false)} aria-label="Đóng"><X className="size-5" /></button>
            <CustomerPanel key={selected.id} contact={selected} products={products}
              onDeleted={() => { setShowInfo(false); onBack(); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function Chat({ contact, products, onBack, onInfo }: {
  contact: ContactDTO; products: ProductDTO[]; onBack: () => void; onInfo: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [, startSend] = useTransition();
  const [messages, addOptimistic] = useOptimistic(contact.messages,
    (state: MessageDTO[], m: MessageDTO) => [...state, m]);

  const suggest = () => {
    setLoading(true);
    setTimeout(() => { setSuggestions(templateSuggestions(contact, products)); setLoading(false); }, 500);
  };

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setSuggestions(null);
    startSend(async () => {
      addOptimistic({ id: "tmp-" + Date.now(), direction: "out", text, sentAt: new Date().toISOString() });
      const r = await sendMessage(contact.id, text);
      if (!r.ok) { alert(r.error); setDraft(text); }
    });
  };

  return (
    <section className="glass flex min-h-0 min-w-0 flex-1 flex-col rounded-[28px]">
      <div className="flex items-center gap-3 border-b border-white/70 p-3 md:p-4">
        <button onClick={onBack} className="round-btn size-10 md:hidden" aria-label="Quay lại"><ChevronLeft className="size-5" /></button>
        <Avatar name={contact.name} hue={contact.hue} channel={contact.channel} className="size-11" />
        <div className="min-w-0">
          <div className="truncate font-semibold">{contact.name}</div>
          <div className="text-xs text-slate-500">{contact.channel === "facebook" ? "Fanpage Facebook" : "Zalo cá nhân"}</div>
        </div>
        <div className="ml-auto flex gap-2">
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="round-btn size-10" aria-label="Gọi"><Phone className="size-[18px]" /></a>
          )}
          <button onClick={onInfo} className="round-btn size-10 xl:hidden" aria-label="Thông tin khách"><Info className="size-[18px]" /></button>
        </div>
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col-reverse overflow-y-auto p-4">
        {/* flex-col-reverse giữ khung cuộn luôn ở tin mới nhất */}
        <div className="flex flex-col gap-2">
          {messages.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Chưa có tin nhắn</p>}
          {messages.map((m) => (
            <div key={m.id} className={`flex max-w-[80%] flex-col ${m.direction === "out" ? "items-end self-end" : "self-start"}`}>
              <div className={`whitespace-pre-wrap rounded-[20px] px-4 py-2.5 text-sm leading-relaxed ${
                m.direction === "out" ? "rounded-br-md bg-black text-white" : "tile rounded-bl-md"}`}>{m.text}</div>
              <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-400">
                {formatTime(m.sentAt)}{m.direction === "out" && <CheckCheck className="size-3" />}
              </span>
            </div>
          ))}
        </div>
      </div>

      {suggestions && (
        <div className="space-y-2 px-3 pb-2">
          <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-violet-700">
            <Sparkles className="size-3.5" /> Gợi ý: bấm để đưa vào ô soạn
            <button onClick={() => setSuggestions(null)} className="ml-auto text-slate-400" aria-label="Ẩn gợi ý"><X className="size-4" /></button>
          </div>
          <div className="no-scrollbar flex max-h-44 flex-col gap-2 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setDraft(s)}
                className="rounded-2xl border border-violet-200 bg-violet-50/80 px-3.5 py-2.5 text-left text-[13px] text-slate-700 hover:bg-violet-100">{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] md:pb-3">
        <button onClick={suggest} disabled={loading} aria-label="Gợi ý AI"
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-sky-500 px-4 text-sm font-medium text-white shadow-md disabled:opacity-60">
          <Sparkles className={`size-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Gợi ý AI</span>
        </button>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={1} placeholder="Nhập tin nhắn…"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }}
          className="tile max-h-32 min-h-11 flex-1 resize-none rounded-[22px] px-4 py-3 text-sm outline-none [field-sizing:content]" />
        <button onClick={submit} className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-white" aria-label="Gửi">
          <Send className="size-[18px]" />
        </button>
      </div>
    </section>
  );
}

function CustomerPanel({ contact, products, onDeleted }: {
  contact: ContactDTO; products: ProductDTO[]; onDeleted: () => void;
}) {
  const initial = {
    name: contact.name, phone: contact.phone ?? "", note: contact.note ?? "",
    followUp: toLocalInput(contact.followUpAt),
  };
  const [f, setF] = useState(initial);
  const [picking, setPicking] = useState(false);
  const [pending, run] = useRun();
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);

  const attached = products.filter((p) => contact.productIds.includes(p.id));
  const available = products.filter((p) => !contact.productIds.includes(p.id));
  const current = STAGES.findIndex((s) => s.id === contact.stage);

  const save = () => run(() => updateContact(contact.id, {
    name: f.name, phone: f.phone, note: f.note, followUpAt: fromLocalInput(f.followUp),
  }));
  const remove = () => {
    if (confirm(`Xóa khách ${contact.name} và toàn bộ tin nhắn?`)) run(() => deleteContact(contact.id), onDeleted);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-[28px] p-5">
        <div className="text-center">
          <Avatar name={f.name || contact.name} hue={contact.hue} channel={contact.channel} className="mx-auto size-16 text-lg" />
          {contact.followUpAt && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600">
              <CalendarClock className="size-3.5" /> Follow-up: {formatFollowUp(contact.followUpAt)}
            </p>
          )}
        </div>
        <div className="mt-4 space-y-2.5">
          <Field label="Tên"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Số điện thoại"><input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inputCls} /></Field>
          <Field label="Nhắc follow-up"><input type="datetime-local" value={f.followUp} onChange={(e) => setF({ ...f, followUp: e.target.value })} className={inputCls} /></Field>
          <Field label="Ghi chú"><textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} className={`${inputCls} resize-none`} /></Field>
          {dirty && (
            <div className="flex gap-2">
              <button onClick={() => setF(initial)} className="round-btn h-10 flex-1 text-sm">Hủy</button>
              <PrimaryButton onClick={save} disabled={pending} className="h-10 flex-1">{pending ? "Đang lưu…" : "Lưu"}</PrimaryButton>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-[28px] p-4">
        <h3 className="mb-3 px-1 text-sm font-semibold">Trạng thái</h3>
        <ol className="space-y-1.5">
          {STAGES.map((s, i) => (
            <li key={s.id}>
              <button onClick={() => run(() => updateContact(contact.id, { stage: s.id }))}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm ${
                  s.id === contact.stage ? "bg-black text-white" : "tile"}`}>
                <span className={`grid size-6 place-items-center rounded-full text-[11px] ${
                  s.id === contact.stage ? "bg-white text-black" : i < current ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {i < current ? "✓" : i + 1}
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="glass rounded-[28px] p-4">
        <h3 className="mb-3 px-1 text-sm font-semibold">Sản phẩm quan tâm</h3>
        <div className="space-y-2">
          {attached.map((p) => (
            <div key={p.id} className="tile relative rounded-2xl p-3 pr-10">
              <div className="text-[11px] font-semibold text-slate-400">{p.code}</div>
              <div className="text-[13px] font-medium leading-snug">{p.name}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-bold text-rose-600">{vnd(p.salePrice ?? p.price)}</span>
                {p.salePrice && <span className="text-[11px] text-slate-400 line-through">{vnd(p.price)}</span>}
              </div>
              <button onClick={() => run(() => setInterest(contact.id, p.id, false))}
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100" aria-label={`Bỏ ${p.code}`}>
                <X className="size-4" />
              </button>
            </div>
          ))}
          {picking ? (
            <select autoFocus defaultValue="" className={inputCls}
              onChange={(e) => { if (e.target.value) run(() => setInterest(contact.id, e.target.value, true)); setPicking(false); }}
              onBlur={() => setPicking(false)}>
              <option value="" disabled>Chọn sản phẩm…</option>
              {available.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
            </select>
          ) : (
            <button onClick={() => setPicking(true)} disabled={available.length === 0}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-400/60 py-2.5 text-xs text-slate-500 disabled:opacity-50">
              <Plus className="size-4" /> {available.length ? "Gắn sản phẩm" : "Đã gắn hết sản phẩm"}
            </button>
          )}
        </div>
      </div>

      <button onClick={remove} className="flex w-full items-center justify-center gap-1.5 rounded-full py-3 text-sm text-rose-600 hover:bg-white/50">
        <Trash2 className="size-4" /> Xóa khách hàng
      </button>
    </div>
  );
}

export function NewContactForm({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ name: "", channel: "zalo" as Channel, phone: "" });
  const [pending, run] = useRun();
  return (
    <Modal title="Thêm khách hàng" onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => createContact(f), onClose); }}>
        <Field label="Tên khách *"><input required autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></Field>
        <Field label="Kênh">
          <div className="flex gap-2">
            {(["zalo", "facebook"] as const).map((c) => (
              <button type="button" key={c} onClick={() => setF({ ...f, channel: c })}
                className={`flex-1 rounded-full py-2.5 text-sm ${f.channel === c ? "bg-black text-white" : "tile"}`}>
                {c === "zalo" ? "Zalo" : "Facebook"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Số điện thoại"><input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inputCls} /></Field>
        <p className="px-1 text-xs text-slate-500">Khi đã kết nối Zalo/Facebook, khách nhắn tới sẽ tự được thêm vào.</p>
        <PrimaryButton type="submit" disabled={pending} className="w-full">{pending ? "Đang lưu…" : "Thêm"}</PrimaryButton>
      </form>
    </Modal>
  );
}
