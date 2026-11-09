import { cookies } from "next/headers";
import { json, sameOrigin } from "@/lib/server/http";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session-token";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "請求來源不正確。" }, 403);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return json({ ok: true });
}
