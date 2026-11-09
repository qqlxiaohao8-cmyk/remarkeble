import { getSession } from "@/lib/server/current-admin";
import { json } from "@/lib/server/http";

export async function GET() {
  const admin = await getSession();
  if (!admin) return json({ admin: null }, 401);
  return json({ admin });
}
