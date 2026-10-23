"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Bell, CalendarClock, Layers, MessageCircle, Package, Plug, Plus, Search, Users } from "lucide-react";
import { markRead } from "@/app/actions";
import type { ContactDTO, ProductDTO } from "@/lib/types";
import { Connections } from "./connections";
import { Inbox, NewContactForm } from "./inbox";
import { Pipeline, Reports } from "./overview";
import { Products } from "./products";
import { Avatar } from "./ui";

type View = "inbox" | "customers" | "products" | "reports" | "connections";

const NAV: { id: View; label: string; icon: typeof MessageCircle }[] = [
  { id: "inbox", label: "Hộp thư", icon: MessageCircle },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "reports", label: "Báo cáo", icon: BarChart3 },
  { id: "connections", label: "Kết nối", icon: Plug },
];

const TITLES: Record<View, string> = {
  inbox: "Hộp thư",
  customers: "Hành trình khách hàng",
  products: "Danh mục sản phẩm",
  reports: "Báo cáo",
  connections: "Kết nối kênh",
};

// Khi server báo có tin mới, tải lại dữ liệu trang (không mất trạng thái giao diện).
function useLiveUpdates() {
  const router = useRouter();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const es = new EventSource("/api/events");
    es.onmessage = (e) => {
      if (JSON.parse(e.data).type !== "data") return;
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 150);
    };
    return () => { clearTimeout(timer); es.close(); };
  }, [router]);
}

export default function AppShell({ contacts, products }: { contacts: ContactDTO[]; products: ProductDTO[] }) {
  const [view, setView] = useState<View>("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingContact, setAddingContact] = useState(false);
  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);
  useLiveUpdates();

  // Tin mới đến hội thoại đang mở thì coi như đã đọc.
  const openUnread = view === "inbox" && contacts.find((c) => c.id === selectedId)?.unread;
  useEffect(() => {
    if (openUnread && selectedId) markRead(selectedId);
  }, [openUnread, selectedId]);

  const open = (id: string) => {
    setSelectedId(id);
    setView("inbox");
    if (contacts.find((c) => c.id === id)?.unread) markRead(id);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden pt-[env(safe-area-inset-top)]">
      <Header view={view} setView={setView} unread={totalUnread} />

      <div className="flex min-h-0 flex-1 gap-4 px-3 pb-3 md:px-5 md:pb-5">
        <Rail view={view} setView={setView} onAdd={() => setAddingContact(true)} />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <h1 className="mb-3 hidden text-2xl font-bold tracking-tight md:block lg:text-3xl">{TITLES[view]}</h1>
          {view === "inbox" && (
            <Inbox contacts={contacts} products={products} selectedId={selectedId}
              onOpen={open} onBack={() => setSelectedId(null)} onNewContact={() => setAddingContact(true)} />
          )}
          {view === "customers" && (
            <Pipeline contacts={contacts} products={products} onOpen={open} onNewContact={() => setAddingContact(true)} />
          )}
          {view === "products" && <Products products={products} />}
          {view === "reports" && <Reports contacts={contacts} />}
          {view === "connections" && <Connections />}
        </main>
      </div>

      {/* Thanh điều hướng dưới cho màn hình ngoài (gập) */}
      <BottomNav view={view} setView={setView} unread={totalUnread}
        hidden={view === "inbox" && selectedId !== null} />

      {addingContact && <NewContactForm onClose={() => setAddingContact(false)} />}
    </div>
  );
}

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
        <button onClick={() => setView("inbox")} className="round-btn relative size-10 md:size-11" aria-label="Thông báo">
          <Bell className="size-[18px]" />
          {unread > 0 && <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose-500" />}
        </button>
        <Avatar name="Quốc Thịnh" hue={20} className="size-10 md:size-11" />
      </div>
    </header>
  );
}

function Rail({ view, setView, onAdd }: { view: View; setView: (v: View) => void; onAdd: () => void }) {
  return (
    <aside className="hidden w-14 shrink-0 flex-col items-center gap-3 md:flex">
      {NAV.map((n) => (
        <button key={n.id} onClick={() => setView(n.id)} aria-label={n.label} title={n.label}
          className={view === n.id ? "grid size-12 place-items-center rounded-full bg-black text-white" : "round-btn size-12"}>
          <n.icon className="size-5" />
        </button>
      ))}
      <button onClick={() => setView("customers")} className="round-btn size-12" aria-label="Lịch follow-up" title="Lịch follow-up">
        <CalendarClock className="size-5" />
      </button>
      <button onClick={onAdd} className="round-btn size-12" aria-label="Thêm khách hàng" title="Thêm khách hàng">
        <Plus className="size-5" />
      </button>
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
