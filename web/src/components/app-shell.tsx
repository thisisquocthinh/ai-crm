"use client";

import { useMemo, useState } from "react";
import {
  Bell, BarChart3, CalendarClock, ChevronLeft, Info, Layers, MessageCircle,
  Moon, Package, Phone, Plus, Search, Send, Sparkles, Sun, Users, X, CheckCheck,
} from "lucide-react";
import {
  CONVERSATIONS, PRODUCTS, STAGES, initials, mockSuggestions, vnd,
  type Channel, type Conversation, type Stage,
} from "@/lib/mock-data";

type View = "inbox" | "customers" | "products" | "reports";

const NAV: { id: View; label: string; icon: typeof MessageCircle }[] = [
  { id: "inbox", label: "Hộp thư", icon: MessageCircle },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "reports", label: "Báo cáo", icon: BarChart3 },
];

const TITLES: Record<View, string> = {
  inbox: "Hộp thư",
  customers: "Hành trình khách hàng",
  products: "Danh mục sản phẩm",
  reports: "Báo cáo",
};

export default function AppShell() {
  const [view, setView] = useState<View>("inbox");
  const [convs, setConvs] = useState(CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  const open = (id: string) => {
    setSelectedId(id);
    setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    setView("inbox");
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden pt-[env(safe-area-inset-top)]">
      <Header view={view} setView={setView} unread={totalUnread} />

      <div className="flex min-h-0 flex-1 gap-4 px-3 pb-3 md:px-5 md:pb-5">
        <Rail view={view} setView={setView} />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <h1 className={`mb-3 hidden text-2xl font-bold tracking-tight md:block lg:text-3xl`}>
            {TITLES[view]}
          </h1>
          {view === "inbox" && (
            <Inbox convs={convs} setConvs={setConvs} selectedId={selectedId}
              onOpen={open} onBack={() => setSelectedId(null)} />
          )}
          {view === "customers" && <Pipeline convs={convs} onOpen={open} />}
          {view === "products" && <Products />}
          {view === "reports" && <Reports convs={convs} />}
        </main>
      </div>

      {/* Thanh điều hướng dưới cho màn hình ngoài (gập) */}
      <BottomNav view={view} setView={setView} unread={totalUnread}
        hidden={view === "inbox" && selectedId !== null} />
    </div>
  );
}

/* ---------------- Khung ---------------- */

function Header({ view, setView, unread }: { view: View; setView: (v: View) => void; unread: number }) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-4">
      <div className="flex items-center gap-2">
        <Layers className="size-6" strokeWidth={2.4} />
        <span className="text-xl font-semibold tracking-tight">ai<span className="font-normal">crm</span></span>
      </div>
      <span className="ml-1 text-sm font-semibold text-slate-500 md:hidden">· {TITLES[view]}</span>

      <nav className="mx-auto hidden items-center gap-1 lg:flex">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setView(n.id)}
            className={`rounded-full px-5 py-2.5 text-sm transition ${
              view === n.id ? "bg-black text-white" : "text-slate-700 hover:bg-white/60"}`}>
            {n.label}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <button className="round-btn size-10 md:size-11" aria-label="Tìm kiếm"><Search className="size-[18px]" /></button>
        <button className="round-btn relative size-10 md:size-11" aria-label="Thông báo">
          <Bell className="size-[18px]" />
          {unread > 0 && <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose-500" />}
        </button>
        <Avatar name="Quốc Thịnh" hue={20} className="size-10 md:size-11" />
      </div>
    </header>
  );
}

function Rail({ view, setView }: { view: View; setView: (v: View) => void }) {
  const [dark, setDark] = useState(false);
  return (
    <aside className="hidden w-14 shrink-0 flex-col items-center gap-3 md:flex">
      {NAV.map((n) => (
        <button key={n.id} onClick={() => setView(n.id)} aria-label={n.label} title={n.label}
          className={view === n.id ? "grid size-12 place-items-center rounded-full bg-black text-white" : "round-btn size-12"}>
          <n.icon className="size-5" />
        </button>
      ))}
      <button className="round-btn size-12" aria-label="Lịch hẹn" title="Lịch hẹn"><CalendarClock className="size-5" /></button>
      <button className="round-btn size-12" aria-label="Thêm" title="Thêm"><Plus className="size-5" /></button>
      <div className="mt-auto flex flex-col gap-3">
        <button onClick={() => setDark(false)} aria-label="Sáng"
          className={!dark ? "grid size-12 place-items-center rounded-full bg-black text-white" : "round-btn size-12"}><Sun className="size-5" /></button>
        <button onClick={() => setDark(true)} aria-label="Tối"
          className={dark ? "grid size-12 place-items-center rounded-full bg-black text-white" : "round-btn size-12"}><Moon className="size-5" /></button>
      </div>
    </aside>
  );
}

function BottomNav({ view, setView, unread, hidden }: { view: View; setView: (v: View) => void; unread: number; hidden: boolean }) {
  if (hidden) return null;
  return (
    <nav className="glass mx-3 mb-[calc(env(safe-area-inset-bottom)+12px)] flex justify-around rounded-full p-1.5 md:hidden">
      {NAV.map((n) => (
        <button key={n.id} onClick={() => setView(n.id)}
          className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] ${
            view === n.id ? "bg-black text-white" : "text-slate-600"}`}>
          <n.icon className="size-5" />
          {n.label}
          {n.id === "inbox" && unread > 0 && (
            <span className="absolute right-[22%] top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] text-white">{unread}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

/* ---------------- Hộp thư ---------------- */

function Inbox({ convs, setConvs, selectedId, onOpen, onBack }: {
  convs: Conversation[];
  setConvs: React.Dispatch<React.SetStateAction<Conversation[]>>;
  selectedId: string | null;
  onOpen: (id: string) => void;
  onBack: () => void;
}) {
  const [filter, setFilter] = useState<"all" | Channel | "unread">("all");
  const [q, setQ] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const selected = convs.find((c) => c.id === selectedId) ?? null;

  const list = useMemo(() => convs.filter((c) =>
    (filter === "all" || (filter === "unread" ? c.unread > 0 : c.channel === filter)) &&
    c.name.toLowerCase().includes(q.toLowerCase())), [convs, filter, q]);

  const send = (text: string) => {
    if (!selected) return;
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setConvs((cs) => cs.map((c) => c.id === selected.id
      ? { ...c, lastAt: now, messages: [...c.messages, { id: crypto.randomUUID(), from: "minh", text, time: now }] }
      : c));
  };

  const setStage = (stage: Stage) => {
    if (!selected) return;
    setConvs((cs) => cs.map((c) => (c.id === selected.id ? { ...c, stage } : c)));
  };

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      {/* Danh sách: luôn hiện từ md; trên màn ngoài chỉ hiện khi chưa chọn */}
      <section className={`glass min-h-0 min-w-0 flex-col rounded-[28px] p-3 md:flex md:w-[300px] md:shrink-0 lg:w-[340px] ${
        selected ? "hidden" : "flex flex-1"}`}>
        <div className="tile flex items-center gap-2 rounded-full px-4 py-2.5">
          <Search className="size-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm khách hàng…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {([["all", "Tất cả"], ["unread", "Chưa đọc"], ["facebook", "Facebook"], ["zalo", "Zalo"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${
                filter === id ? "bg-black text-white" : "bg-white/60 text-slate-600"}`}>{label}</button>
          ))}
        </div>
        <ul className="no-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
          {list.map((c) => (
            <li key={c.id}>
              <button onClick={() => onOpen(c.id)}
                className={`flex w-full items-center gap-3 rounded-[22px] p-3 text-left transition ${
                  c.id === selectedId ? "bg-black text-white" : "tile hover:bg-white"}`}>
                <Avatar name={c.name} hue={c.hue} channel={c.channel} className="size-11" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{c.name}</span>
                    <span className={`ml-auto shrink-0 text-[11px] ${c.id === selectedId ? "text-white/60" : "text-slate-400"}`}>{c.lastAt}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`truncate text-xs ${c.id === selectedId ? "text-white/70" : c.unread ? "font-medium text-slate-800" : "text-slate-500"}`}>
                      {c.messages.at(-1)?.from === "minh" && "Bạn: "}{c.messages.at(-1)?.text}
                    </span>
                    {c.unread > 0 && (
                      <span className="ml-auto grid size-5 shrink-0 place-items-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">{c.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="py-10 text-center text-sm text-slate-500">Không có hội thoại</li>}
        </ul>
      </section>

      {/* Khung chat */}
      {selected ? (
        <Chat key={selected.id} conv={selected} onBack={onBack} onSend={send} onInfo={() => setShowInfo(true)} />
      ) : (
        <section className="glass hidden flex-1 place-items-center rounded-[28px] md:grid">
          <div className="text-center text-slate-500">
            <MessageCircle className="mx-auto size-10 text-slate-400" />
            <p className="mt-3 text-sm">Chọn một hội thoại để bắt đầu</p>
          </div>
        </section>
      )}

      {/* Thông tin khách: cột riêng trên màn rộng, sheet trượt trên màn nhỏ */}
      {selected && (
        <aside className="hidden w-[300px] shrink-0 xl:block">
          <CustomerPanel conv={selected} setStage={setStage} />
        </aside>
      )}
      {selected && showInfo && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/20 backdrop-blur-sm xl:hidden" onClick={() => setShowInfo(false)}>
          <div className="h-full w-full max-w-[380px] overflow-y-auto bg-[#e4e8f0] p-3" onClick={(e) => e.stopPropagation()}>
            <button className="round-btn mb-3 ml-auto size-10" onClick={() => setShowInfo(false)} aria-label="Đóng"><X className="size-5" /></button>
            <CustomerPanel conv={selected} setStage={setStage} />
          </div>
        </div>
      )}
    </div>
  );
}

function Chat({ conv, onBack, onSend, onInfo }: {
  conv: Conversation; onBack: () => void; onSend: (t: string) => void; onInfo: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const suggest = () => {
    setLoading(true);
    setTimeout(() => { setSuggestions(mockSuggestions(conv)); setLoading(false); }, 700);
  };
  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
    setSuggestions(null);
  };

  return (
    <section className="glass flex min-h-0 min-w-0 flex-1 flex-col rounded-[28px]">
      <div className="flex items-center gap-3 border-b border-white/70 p-3 md:p-4">
        <button onClick={onBack} className="round-btn size-10 md:hidden" aria-label="Quay lại"><ChevronLeft className="size-5" /></button>
        <Avatar name={conv.name} hue={conv.hue} channel={conv.channel} className="size-11" />
        <div className="min-w-0">
          <div className="truncate font-semibold">{conv.name}</div>
          <div className="text-xs text-slate-500">{conv.channel === "facebook" ? "Fanpage Facebook" : "Zalo cá nhân"}</div>
        </div>
        <div className="ml-auto flex gap-2">
          {conv.phone && <button className="round-btn size-10" aria-label="Gọi"><Phone className="size-[18px]" /></button>}
          <button onClick={onInfo} className="round-btn size-10 xl:hidden" aria-label="Thông tin khách"><Info className="size-[18px]" /></button>
        </div>
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {conv.messages.map((m) => (
          <div key={m.id} className={`flex max-w-[80%] flex-col ${m.from === "minh" ? "self-end items-end" : "self-start"}`}>
            <div className={`rounded-[20px] px-4 py-2.5 text-sm leading-relaxed ${
              m.from === "minh" ? "rounded-br-md bg-black text-white" : "tile rounded-bl-md"}`}>{m.text}</div>
            <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-400">
              {m.time}{m.from === "minh" && <CheckCheck className="size-3" />}
            </span>
          </div>
        ))}
      </div>

      {suggestions && (
        <div className="space-y-2 px-3 pb-2">
          <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-violet-700">
            <Sparkles className="size-3.5" /> Gợi ý từ AI: bấm để đưa vào ô soạn
            <button onClick={() => setSuggestions(null)} className="ml-auto text-slate-400" aria-label="Ẩn"><X className="size-4" /></button>
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
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          className="tile max-h-32 min-h-11 flex-1 resize-none rounded-[22px] px-4 py-3 text-sm outline-none [field-sizing:content]" />
        <button onClick={submit} className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-white" aria-label="Gửi">
          <Send className="size-[18px]" />
        </button>
      </div>
    </section>
  );
}

function CustomerPanel({ conv, setStage }: { conv: Conversation; setStage: (s: Stage) => void }) {
  const products = PRODUCTS.filter((p) => conv.interestedCodes.includes(p.code));
  const current = STAGES.findIndex((s) => s.id === conv.stage);
  return (
    <div className="space-y-4">
      <div className="glass rounded-[28px] p-5 text-center">
        <Avatar name={conv.name} hue={conv.hue} channel={conv.channel} className="mx-auto size-16 text-lg" />
        <div className="mt-3 font-semibold">{conv.name}</div>
        <div className="text-xs text-slate-500">{conv.phone ?? "Chưa có SĐT"}</div>
        {conv.note && <p className="tile mt-3 rounded-2xl px-3 py-2 text-left text-xs text-slate-600">📝 {conv.note}</p>}
        {conv.followUp && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600">
            <CalendarClock className="size-3.5" /> Follow-up: {conv.followUp}
          </p>
        )}
      </div>

      <div className="glass rounded-[28px] p-4">
        <h3 className="mb-3 px-1 text-sm font-semibold">Trạng thái</h3>
        <ol className="relative space-y-1.5">
          {STAGES.map((s, i) => (
            <li key={s.id}>
              <button onClick={() => setStage(s.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm ${
                  s.id === conv.stage ? "bg-black text-white" : "tile"}`}>
                <span className={`grid size-6 place-items-center rounded-full text-[11px] ${
                  s.id === conv.stage ? "bg-white text-black" : i < current ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {i < current && s.id !== "khong_mua" ? "✓" : i + 1}
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
          {products.map((p) => (
            <div key={p.code} className="tile rounded-2xl p-3">
              <div className="text-[11px] font-semibold text-slate-400">{p.code}</div>
              <div className="text-[13px] font-medium leading-snug">{p.name}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-bold text-rose-600">{vnd(p.salePrice ?? p.price)}</span>
                {p.salePrice && <span className="text-[11px] text-slate-400 line-through">{vnd(p.price)}</span>}
              </div>
            </div>
          ))}
          <button className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-400/60 py-2.5 text-xs text-slate-500">
            <Plus className="size-4" /> Gắn sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Hành trình khách hàng (giống bảng Customer Journeys) ---------------- */

function Pipeline({ convs, onOpen }: { convs: Conversation[]; onOpen: (id: string) => void }) {
  return (
    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
      <section className="glass rounded-[32px] p-4 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-lg font-semibold">Khách đang theo dõi</h2>
          <div className="ml-2 hidden -space-x-2 sm:flex">
            {convs.slice(0, 6).map((c) => <Avatar key={c.id} name={c.name} hue={c.hue} className="size-9 ring-2 ring-white" />)}
          </div>
          <button className="round-btn ml-auto size-11" aria-label="Thêm khách"><Plus className="size-5" /></button>
        </div>
        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-2 xl:grid-cols-4">
          {STAGES.filter((s) => s.id !== "khong_mua").map((s) => {
            const items = convs.filter((c) => c.stage === s.id);
            return (
              <div key={s.id} className="flex w-[80%] shrink-0 snap-start flex-col md:w-auto">
                <div className="flex min-h-[220px] flex-1 flex-col gap-2 rounded-[26px] bg-white/55 p-3">
                  {items.map((c) => (
                    <button key={c.id} onClick={() => onOpen(c.id)}
                      className="tile flex items-center gap-3 rounded-[20px] p-3 text-left hover:bg-white">
                      <Avatar name={c.name} hue={c.hue} channel={c.channel} className="size-10" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{c.name}</div>
                        <div className="truncate text-xs text-slate-500">
                          {PRODUCTS.find((p) => p.code === c.interestedCodes[0])?.name ?? "—"}
                        </div>
                      </div>
                      {c.followUp && <CalendarClock className="size-4 shrink-0 text-rose-500" />}
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
    </div>
  );
}

/* ---------------- Sản phẩm (giống bảng Suggested Knowledge) ---------------- */

function Products() {
  const [q, setQ] = useState("");
  const list = PRODUCTS.filter((p) => (p.code + p.name).toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="glass flex min-h-0 flex-1 flex-col rounded-[32px] p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="tile flex flex-1 items-center gap-2 rounded-full px-4 py-2.5 md:max-w-sm">
          <Search className="size-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã hoặc tên…"
            className="w-full bg-transparent text-sm outline-none" />
        </div>
        <button className="ml-auto flex h-11 items-center gap-1.5 rounded-full bg-black px-4 text-sm text-white">
          <Plus className="size-4" /> <span className="hidden sm:inline">Thêm sản phẩm</span>
        </button>
      </div>

      {/* Bảng trên màn rộng */}
      <div className="no-scrollbar hidden min-h-0 flex-1 overflow-y-auto md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500">
            <tr className="border-b border-white/80">
              <th className="py-3 pl-2 font-normal">Mã</th><th className="font-normal">Tên sản phẩm</th>
              <th className="font-normal">Loại</th><th className="font-normal">Giá gốc</th>
              <th className="pr-2 font-normal">Giá bán</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.code} className="border-b border-white/50">
                <td className="py-3.5 pl-2 font-mono text-xs font-semibold">{p.code}</td>
                <td className="pr-4">{p.name}{p.note && <div className="text-xs text-slate-500">{p.note}</div>}</td>
                <td><span className="rounded-full bg-sky-500/90 px-3 py-1 text-xs text-white">{p.category}</span></td>
                <td className="text-slate-400 line-through">{p.salePrice ? vnd(p.price) : ""}</td>
                <td className="pr-2 font-semibold text-rose-600">{vnd(p.salePrice ?? p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thẻ trên màn ngoài */}
      <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto md:hidden">
        {list.map((p) => (
          <div key={p.code} className="tile rounded-[20px] p-3.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-slate-500">{p.code}</span>
              <span className="ml-auto rounded-full bg-sky-500/90 px-2.5 py-0.5 text-[11px] text-white">{p.category}</span>
            </div>
            <div className="mt-1 text-sm font-medium">{p.name}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-bold text-rose-600">{vnd(p.salePrice ?? p.price)}</span>
              {p.salePrice && <span className="text-xs text-slate-400 line-through">{vnd(p.price)}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Báo cáo ---------------- */

function Reports({ convs }: { convs: Conversation[] }) {
  const counts = STAGES.map((s) => ({ ...s, n: convs.filter((c) => c.stage === s.id).length }));
  const closed = counts.find((c) => c.id === "da_chot")!.n;
  const rate = Math.round((closed / convs.length) * 100);
  const fb = convs.filter((c) => c.channel === "facebook").length;
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
      </section>
      <section className="glass rounded-[32px] p-6">
        <h2 className="font-semibold">Theo trạng thái</h2>
        <div className="mt-4 space-y-3">
          {counts.map((c) => (
            <div key={c.id}>
              <div className="mb-1 flex justify-between text-xs"><span>{c.label}</span><span>{c.n}</span></div>
              <div className="h-2.5 rounded-full bg-white/70">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${(c.n / convs.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="glass rounded-[32px] p-6 md:col-span-2">
        <h2 className="font-semibold">Theo kênh</h2>
        <div className="mt-4 flex gap-3">
          <div className="tile flex-1 rounded-[22px] p-4"><div className="text-xs text-slate-500">Facebook</div><div className="text-3xl font-bold text-blue-600">{fb}</div></div>
          <div className="tile flex-1 rounded-[22px] p-4"><div className="text-xs text-slate-500">Zalo</div><div className="text-3xl font-bold text-sky-500">{convs.length - fb}</div></div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Dùng chung ---------------- */

function Avatar({ name, hue, channel, className = "" }: { name: string; hue: number; channel?: Channel; className?: string }) {
  return (
    <span className={`relative inline-grid shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${hue + 30} 65% 45%))` }}>
      {initials(name)}
      {channel && (
        <span className={`absolute -bottom-0.5 -right-0.5 grid size-[18px] place-items-center rounded-full text-[8px] font-bold ring-2 ring-white ${
          channel === "facebook" ? "bg-blue-600" : "bg-sky-500"}`}>
          {channel === "facebook" ? "f" : "Z"}
        </span>
      )}
    </span>
  );
}
