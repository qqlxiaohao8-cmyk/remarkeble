import { requireAdmin } from "@/lib/server/guard";
import { json } from "@/lib/server/http";
import { deleteRestaurant, updateRestaurant } from "@/lib/server/store";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(request);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const result = await updateRestaurant(id, await request.json().catch(() => null));
  if ("error" in result) return json({ error: result.error }, result.error === "找不到這間餐廳。" ? 404 : 400);
  return json(result);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(request);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const result = await deleteRestaurant(id);
  if ("error" in result) return json({ error: result.error }, 404);
  return json(result);
}
