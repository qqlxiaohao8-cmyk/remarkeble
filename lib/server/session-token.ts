import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "rmk_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type Role = "super" | "admin";

type Payload = {
  sub: string;
  exp: number;
};

export function signSession(adminId: string) {
  const payload = Buffer.from(
    JSON.stringify({ sub: adminId, exp: Date.now() + SESSION_MAX_AGE * 1000 } satisfies Payload),
  ).toString("base64url");
  const signature = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSessionToken(token: string | undefined, now: number) {
  if (!token || !authSecretReady()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Payload;
    if (!data || typeof data.sub !== "string" || typeof data.exp !== "number") return null;
    if (data.exp < now) return null;
    return { id: data.sub };
  } catch {
    return null;
  }
}

const DEV_AUTH_SECRET = "remarkeble-local-session-key-7f3a9c2e";

export function authSecretReady() {
  return secretValue().length >= 32;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

function authSecret() {
  const secret = secretValue();
  if (secret.length < 32) throw new Error("AUTH_SECRET is not configured");
  return secret;
}

function secretValue() {
  const configured = process.env.AUTH_SECRET ?? "";
  if (configured.length >= 32) return configured;
  return DEV_AUTH_SECRET;
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type AdminRole = Role;
