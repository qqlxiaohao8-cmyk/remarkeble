import { cookies } from "next/headers";
import { clearAttempts, clientKey, tooManyAttempts } from "@/lib/server/guard";
import { json, sameOrigin } from "@/lib/server/http";
import { authSecretReady, SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/server/session-token";
import { archiveConfigured, authenticate } from "@/lib/server/store";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "請求來源不正確。" }, 403);
  if (!authSecretReady()) return json({ error: "檔案室尚未設定帳戶。" }, 503);
  if (!(await archiveConfigured())) return json({ error: "檔案室尚未設定帳戶。" }, 503);
  const key = clientKey(request);
  if (tooManyAttempts(key)) return json({ error: "嘗試太多次，請稍後再來。" }, 429);
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return json({ error: "電郵或密碼不正確。" }, 401);
  const admin = await authenticate(email, password);
  if (!admin) return json({ error: "電郵或密碼不正確。" }, 401);
  clearAttempts(key);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(admin.id), sessionCookieOptions());
  return json({ admin });
}
