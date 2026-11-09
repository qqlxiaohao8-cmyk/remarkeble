import { requireAdmin } from "@/lib/server/guard";
import { json } from "@/lib/server/http";
import { saveImage } from "@/lib/server/media";

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (session instanceof Response) return session;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "請選擇一張圖片。" }, 400);
  const saved = await saveImage(Buffer.from(await file.arrayBuffer()));
  if ("error" in saved) return json({ error: saved.error }, 400);
  return json(saved, 201);
}
