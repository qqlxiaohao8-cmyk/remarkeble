import { requireAdmin } from "@/lib/server/guard";
import { json } from "@/lib/server/http";
import { acceptRestaurant, createRestaurant, listRestaurants } from "@/lib/server/store";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;
  return json({ restaurants: await listRestaurants() });
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (session instanceof Response) return session;
  const parsed = acceptRestaurant(await request.json().catch(() => null));
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const result = await createRestaurant(parsed.value);
  if ("error" in result) return json({ error: result.error }, 409);
  return json(result, 201);
}
