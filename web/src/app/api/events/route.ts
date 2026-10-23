import { appEvents, type AppEvent } from "@/server/events";

export const dynamic = "force-dynamic";

// Server-Sent Events: báo cho giao diện tải lại dữ liệu khi có tin mới.
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (e: AppEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      const ping = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), 25_000);
      appEvents.on("event", send);
      cleanup = () => { clearInterval(ping); appEvents.off("event", send); };
      req.signal.addEventListener("abort", () => { cleanup(); controller.close(); });
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
