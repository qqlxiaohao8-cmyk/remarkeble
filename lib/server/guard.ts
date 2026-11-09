import { json, sameOrigin } from "@/lib/server/http";
import { getSession, type CurrentAdmin } from "@/lib/server/current-admin";

const attempts = new Map<string, { count: number; reset: number }>();

export async function requireAdmin(request?: Request): Promise<CurrentAdmin | Response> {
  if (request && !sameOrigin(request)) return json({ error: "請求來源不正確。" }, 403);
  const session = await getSession();
  if (!session) return json({ error: "請先登入。" }, 401);
  return session;
}

export function requireSuper(session: CurrentAdmin) {
  if (session.role !== "super") return json({ error: "只有主管可以管理帳戶。" }, 403);
  return null;
}

export function tooManyAttempts(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.reset < now) {
    attempts.set(key, { count: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 8;
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}

export function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
