// Chạy một lần khi server Next.js khởi động.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { restoreZaloSession } = await import("./server/zalo");
    restoreZaloSession().catch((e) => console.error("[zalo] không khôi phục được phiên:", e));
  }
}
