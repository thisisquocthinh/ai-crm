// Kết nối Zalo cá nhân qua thư viện không chính thức zca-js (giả lập Zalo Web).
// Chạy trong tiến trình server của Next.js; trạng thái lưu trên globalThis để
// hot-reload ở chế độ dev không tạo ra nhiều kết nối.

import {
  CloseReason, LoginQRCallbackEventType, ThreadType, Zalo,
  type API, type Credentials, type Message,
} from "zca-js";
import { db } from "@/lib/db";
import { emit } from "./events";

export type ZaloStatus =
  | { state: "disconnected"; reason?: string; canReconnect?: boolean }
  | { state: "qr"; qrImage: string }
  | { state: "scanned"; name: string; avatar: string }
  | { state: "connecting" }
  | { state: "connected"; name: string; avatar: string; uid: string };

type Store = {
  status: ZaloStatus;
  api: API | null;
  abortLogin: (() => unknown) | null;
  restored: boolean;
};

const g = globalThis as unknown as { zalo?: Store };
const store: Store = (g.zalo ??= { status: { state: "disconnected" }, api: null, abortLogin: null, restored: false });

const SESSION_KEY = "zalo.session";

function setStatus(s: ZaloStatus) {
  store.status = s;
  emit({ type: "zalo" });
}

export const getZaloStatus = () => store.status;

const newClient = () => new Zalo({ selfListen: true, checkUpdate: false, logging: false });

/* ---------- Đăng nhập ---------- */

export async function startQRLogin() {
  if (store.status.state === "connected") return;
  store.abortLogin?.();
  store.abortLogin = null;
  setStatus({ state: "connecting" });

  newClient()
    .loginQR({}, async (event) => {
      switch (event.type) {
        case LoginQRCallbackEventType.QRCodeGenerated:
          store.abortLogin = event.actions.abort;
          setStatus({ state: "qr", qrImage: "data:image/png;base64," + event.data.image });
          break;
        case LoginQRCallbackEventType.QRCodeExpired:
          store.abortLogin = null;
          event.actions.abort();
          setStatus({ state: "disconnected", reason: "Mã QR đã hết hạn, hãy tạo mã mới." });
          break;
        case LoginQRCallbackEventType.QRCodeScanned:
          setStatus({ state: "scanned", name: event.data.display_name, avatar: event.data.avatar });
          break;
        case LoginQRCallbackEventType.QRCodeDeclined:
          store.abortLogin = null;
          event.actions.abort();
          setStatus({ state: "disconnected", reason: "Bạn đã từ chối đăng nhập trên điện thoại." });
          break;
        case LoginQRCallbackEventType.GotLoginInfo: {
          const creds: Credentials = { imei: event.data.imei, cookie: event.data.cookie, userAgent: event.data.userAgent };
          await db.setting.upsert({
            where: { key: SESSION_KEY },
            create: { key: SESSION_KEY, value: JSON.stringify(creds) },
            update: { value: JSON.stringify(creds) },
          });
          break;
        }
      }
    })
    .then((api) => {
      store.abortLogin = null;
      if (api) attach(api);
    })
    .catch((e) => {
      store.abortLogin = null;
      // Bị hủy (do tạo mã mới) thì bỏ qua, trạng thái đã được đặt ở nơi khác.
      if (store.status.state === "connecting" || store.status.state === "qr" || store.status.state === "scanned")
        setStatus({ state: "disconnected", reason: "Đăng nhập thất bại: " + errorText(e) });
    });
}

// Gọi khi server khởi động: dùng lại phiên đã lưu để không phải quét QR lại.
export async function restoreZaloSession() {
  if (store.restored) return;
  store.restored = true;
  const saved = await db.setting.findUnique({ where: { key: SESSION_KEY } }).catch(() => null);
  if (!saved) return;
  setStatus({ state: "connecting" });
  try {
    attach(await newClient().login(JSON.parse(saved.value) as Credentials));
  } catch (e) {
    setStatus({ state: "disconnected", reason: "Phiên đăng nhập đã hết hạn, hãy quét QR lại. (" + errorText(e) + ")" });
  }
}

export async function logoutZalo() {
  store.abortLogin?.();
  store.abortLogin = null;
  store.api?.listener.stop();
  store.api = null;
  await db.setting.deleteMany({ where: { key: SESSION_KEY } });
  setStatus({ state: "disconnected" });
}

async function attach(api: API) {
  store.api?.listener.stop();
  store.api = api;
  const uid = api.getOwnId();
  let name = "Zalo", avatar = "";
  try {
    const info = await api.getUserInfo(uid);
    const me = info.changed_profiles[uid];
    if (me) { name = me.displayName || me.zaloName; avatar = me.avatar; }
  } catch { /* không bắt buộc */ }

  const { listener } = api;
  listener.on("connected", () => setStatus({ state: "connected", name, avatar, uid }));
  listener.on("message", (m) => { handleMessage(api, m).catch((e) => console.error("[zalo] lỗi xử lý tin:", e)); });
  listener.on("closed", (code) => {
    if (store.api !== api) return;
    store.api = null;
    setStatus({
      state: "disconnected",
      canReconnect: true,
      reason: code === CloseReason.DuplicateConnection || code === CloseReason.KickConnection
        ? "Zalo Web đang được mở ở nơi khác nên kết nối bị ngắt. Đóng Zalo Web rồi bấm Kết nối lại."
        : `Mất kết nối (mã ${code}). Bấm Kết nối lại.`,
    });
  });
  listener.on("error", (e) => console.error("[zalo] listener:", e));
  listener.start({ retryOnClose: true });
  setStatus({ state: "connected", name, avatar, uid });
}

// Kết nối lại bằng phiên đã lưu (sau khi bị ngắt).
export async function reconnectZalo() {
  store.restored = false;
  await restoreZaloSession();
}

/* ---------- Nhận tin ---------- */

function messageText(m: Message): string {
  const c = m.data.content;
  if (typeof c === "string") return c;
  const t = c as { title?: string; href?: string };
  if (m.data.msgType === "chat.photo") return "[Hình ảnh]";
  if (m.data.msgType === "chat.sticker") return "[Sticker]";
  if (m.data.msgType === "chat.voice") return "[Tin nhắn thoại]";
  if (m.data.msgType === "chat.video.msg") return "[Video]";
  return t.title ? `[Đính kèm] ${t.title}` : t.href ? `[Đính kèm] ${t.href}` : "[Tin nhắn không hỗ trợ]";
}

export async function handleMessage(api: API, m: Message) {
  if (m.type !== ThreadType.User) return; // bỏ qua tin nhóm
  const externalId = m.threadId;
  const msgId = String(m.data.msgId);
  if (await db.message.findFirst({ where: { externalId: msgId, contact: { channel: "zalo" } } })) return;

  const text = messageText(m);
  const sentAt = new Date(Number(m.data.ts) || Date.now());
  let contact = await db.contact.findUnique({ where: { channel_externalId: { channel: "zalo", externalId } } });

  if (!contact) {
    let name = m.isSelf ? "" : m.data.dName;
    let avatarUrl: string | null = null;
    try {
      const p = (await api.getUserInfo(externalId)).changed_profiles[externalId];
      if (p) { name = p.displayName || p.zaloName || name; avatarUrl = p.avatar || null; }
    } catch { /* dùng tên trong tin nhắn */ }
    contact = await db.contact.create({
      data: {
        channel: "zalo", externalId, name: name || "Khách Zalo", avatarUrl,
        hue: Math.floor(Math.random() * 360), lastMessageAt: sentAt,
      },
    });
  }

  if (m.isSelf) {
    // Tin mình gửi từ app này: đã lưu trước khi gửi, chỉ cần gắn mã tin.
    const pending = await db.message.findFirst({
      where: { contactId: contact.id, direction: "out", externalId: null, text, sentAt: { gte: new Date(Date.now() - 120_000) } },
      orderBy: { sentAt: "desc" },
    });
    if (pending) {
      await db.message.update({ where: { id: pending.id }, data: { externalId: msgId } });
      return;
    }
  }

  await db.$transaction([
    db.message.create({ data: { contactId: contact.id, direction: m.isSelf ? "out" : "in", text, externalId: msgId, sentAt } }),
    db.contact.update({
      where: { id: contact.id },
      data: { lastMessageAt: sentAt, ...(m.isSelf ? { unread: 0 } : { unread: { increment: 1 } }) },
    }),
  ]);
  emit({ type: "data" });
}

/* ---------- Gửi tin ---------- */

export async function sendZaloText(threadId: string, text: string): Promise<string> {
  if (!store.api || store.status.state !== "connected") throw new Error("Zalo chưa kết nối. Vào mục Kết nối để đăng nhập.");
  const res = await store.api.sendMessage(text, threadId, ThreadType.User);
  if (!res.message) throw new Error("Zalo không trả về mã tin nhắn");
  return String(res.message.msgId);
}

function errorText(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
