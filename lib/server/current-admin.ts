import { cookies } from "next/headers";
import { connection } from "next/server";
import { readAdmin } from "@/lib/server/store";
import { readSessionToken, SESSION_COOKIE, type AdminRole } from "@/lib/server/session-token";

export type CurrentAdmin = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

export async function getSession(): Promise<CurrentAdmin | null> {
  try {
    await connection();
    const jar = await cookies();
    const token = readSessionToken(jar.get(SESSION_COOKIE)?.value, Date.now());
    if (!token) return null;
    const admin = await readAdmin(token.id);
    if (!admin) return null;
    return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
  } catch {
    return null;
  }
}
