import { EventEmitter } from "node:events";

// Kênh báo cho giao diện biết dữ liệu vừa thay đổi (tin mới, trạng thái Zalo…).
// Lưu trên globalThis để Next.js hot-reload không tạo ra nhiều bản.
export type AppEvent = { type: "data" } | { type: "zalo" };

const g = globalThis as unknown as { appEvents?: EventEmitter };
export const appEvents = (g.appEvents ??= new EventEmitter().setMaxListeners(100));

export const emit = (e: AppEvent) => appEvents.emit("event", e);
