import { getZaloStatus } from "@/server/zalo";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(getZaloStatus());
}
