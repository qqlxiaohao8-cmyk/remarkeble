import { requireAdmin, requireSuper } from "@/lib/server/guard";
import { json } from "@/lib/server/http";
import { createAdmin, listAdmins, type AdminRole } from "@/lib/server/store";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;
  return json({ admins: await listAdmins(), actorId: session.id, role: session.role });
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (session instanceof Response) return session;
  const denied = requireSuper(session);
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    name?: unknown;
    password?: unknown;
    role?: unknown;
  } | null;
  const role: AdminRole = body?.role === "super" ? "super" : "admin";
  const result = await createAdmin({
    email: typeof body?.email === "string" ? body.email : "",
    name: typeof body?.name === "string" ? body.name : "",
    password: typeof body?.password === "string" ? body.password : "",
    role,
  });
  if ("error" in result) return json({ error: result.error }, 400);
  return json(result, 201);
}
