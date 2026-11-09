import { requireAdmin, requireSuper } from "@/lib/server/guard";
import { json } from "@/lib/server/http";
import { deleteAdmin } from "@/lib/server/store";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(request);
  if (session instanceof Response) return session;
  const denied = requireSuper(session);
  if (denied) return denied;
  const { id } = await context.params;
  const result = await deleteAdmin(session.id, id);
  if ("error" in result) return json({ error: result.error }, 400);
  return json(result);
}
