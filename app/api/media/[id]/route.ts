import { getSession } from "@/lib/server/current-admin";
import { readImage } from "@/lib/server/media";
import { listPublicRestaurants, restaurantReferencesMedia } from "@/lib/server/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const image = await readImage(id);
  if (!image) return new Response(null, { status: 404 });
  const session = await getSession();
  if (!session) {
    const published = await listPublicRestaurants();
    if (!restaurantReferencesMedia(published, id)) return new Response(null, { status: 404 });
  }
  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "content-type": image.mime,
      "cache-control": "private, max-age=3600",
      "x-content-type-options": "nosniff",
    },
  });
}
