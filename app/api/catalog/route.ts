import { json } from "@/lib/server/http";
import { listPublicRestaurants } from "@/lib/server/store";

export async function GET() {
  const restaurants = await listPublicRestaurants();
  return json({ restaurants });
}
