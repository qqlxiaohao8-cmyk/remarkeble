import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TYPES: Record<string, { extension: string; mime: string }> = {
  jpg: { extension: "jpg", mime: "image/jpeg" },
  png: { extension: "png", mime: "image/png" },
  webp: { extension: "webp", mime: "image/webp" },
  gif: { extension: "gif", mime: "image/gif" },
};

export async function saveImage(bytes: Buffer) {
  const kind = sniff(bytes);
  if (!kind) return { error: "只接受 JPG、PNG、WEBP 或 GIF。" as const };
  if (bytes.byteLength > 5 * 1024 * 1024) return { error: "圖片不能超過 5MB。" as const };
  const id = randomBytes(16).toString("hex");
  const directory = path.join(process.cwd(), "data", "media");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `${id}.${kind.extension}`), bytes);
  return { id, url: `/api/media/${id}` };
}

export async function readImage(id: string) {
  if (!/^[a-f0-9]{32}$/.test(id)) return null;
  const directory = path.join(process.cwd(), "data", "media");
  for (const kind of Object.values(TYPES)) {
    try {
      const bytes = await readFile(path.join(directory, `${id}.${kind.extension}`));
      return { bytes, mime: kind.mime };
    } catch {
      continue;
    }
  }
  return null;
}

function sniff(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return TYPES.jpg;
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return TYPES.png;
  if (bytes.length >= 6 && bytes.subarray(0, 6).toString("ascii") === "GIF87a") return TYPES.gif;
  if (bytes.length >= 6 && bytes.subarray(0, 6).toString("ascii") === "GIF89a") return TYPES.gif;
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return TYPES.webp;
  }
  return null;
}
