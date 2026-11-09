import { getDistrict, type DistrictId } from "@/lib/districts";
import { normalizeDuration, slugify } from "@/lib/format";
import { normalizeRestaurant } from "@/lib/status";
import {
  MOTIFS,
  PUBLICATION_STATUSES,
  TONES,
  VERIFICATION_STATUSES,
  type Dish,
  type Motif,
  type PublicationStatus,
  type Restaurant,
  type Tone,
  type VerificationStatus,
} from "@/lib/types";

export type RestaurantInput = {
  name: string;
  nameEn: string;
  slug: string;
  districtId: DistrictId;
  address: string;
  lat: number | null;
  lng: number | null;
  hours: string;
  established: string;
  excerpt: string;
  story: string;
  motif: Motif;
  tone: Tone;
  videoTitle: string;
  videoDuration: string;
  videoUrl: string;
  coverImage: string;
  gallery: string[];
  owner: string;
  contact: string;
  visitedOn: string;
  dishes: Dish[];
  publication: PublicationStatus;
  verification: VerificationStatus;
};

const MEDIA_PATH = /^\/api\/media\/[a-f0-9]{32}$/;

export function inputFromRestaurant(restaurant: Restaurant): RestaurantInput {
  const next = normalizeRestaurant(restaurant);
  return {
    name: next.name,
    nameEn: next.nameEn,
    slug: next.slug,
    districtId: next.districtId,
    address: next.address,
    lat: next.lat ?? null,
    lng: next.lng ?? null,
    hours: next.hours,
    established: next.established,
    excerpt: next.excerpt,
    story: next.story,
    motif: next.motif,
    tone: next.tone,
    videoTitle: next.videoTitle,
    videoDuration: next.videoDuration,
    videoUrl: next.videoUrl ?? "",
    coverImage: next.coverImage ?? "",
    gallery: next.gallery ?? [],
    owner: next.owner ?? "",
    contact: next.contact ?? "",
    visitedOn: next.visitedOn ?? "",
    dishes: next.dishes,
    publication: next.publication ?? "draft",
    verification: next.verification ?? "unverified",
  };
}

export function parseRestaurantInput(raw: unknown): { ok: true; value: RestaurantInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "資料不完整。" };
  const record = raw as Record<string, unknown>;
  const name = text(record.name, 80);
  if (!name) return { ok: false, error: "請填餐廳名稱。" };
  const nameEn = text(record.nameEn, 120);
  const slugSource = text(record.slug, 80) || slugify(nameEn);
  const slug = slugify(slugSource);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "網址代號只能用英文和數字。" };
  const districtId = text(record.districtId, 40);
  if (!getDistrict(districtId)) return { ok: false, error: "請選擇地區。" };
  const motif = text(record.motif, 20);
  if (!(MOTIFS as readonly string[]).includes(motif)) return { ok: false, error: "圖樣不正確。" };
  const tone = text(record.tone, 20);
  if (!(TONES as readonly string[]).includes(tone)) return { ok: false, error: "色調不正確。" };
  const publication = text(record.publication, 20);
  if (!(PUBLICATION_STATUSES as readonly string[]).includes(publication)) return { ok: false, error: "出版狀態不正確。" };
  const verification = text(record.verification, 20);
  if (!(VERIFICATION_STATUSES as readonly string[]).includes(verification)) return { ok: false, error: "核實狀態不正確。" };

  const point = coordinates(record.lat, record.lng);
  if (!point.ok) return point;

  const coverImage = text(record.coverImage, 500);
  if (coverImage && !allowedAsset(coverImage)) return { ok: false, error: "封面圖片的位址不正確。" };
  const gallery = stringList(record.gallery, 8, 500);
  if (!gallery.ok) return gallery;
  if (gallery.value.some((item) => !allowedAsset(item))) return { ok: false, error: "相簿裡有不正確的圖片位址。" };

  const videoUrl = text(record.videoUrl, 500);
  if (videoUrl && !isHttp(videoUrl)) return { ok: false, error: "短片位址需要是 http 或 https。" };
  const visitedOn = text(record.visitedOn, 10);
  if (visitedOn && !/^\d{4}-\d{2}-\d{2}$/.test(visitedOn)) return { ok: false, error: "到訪日期請用 YYYY-MM-DD。" };

  const dishes = parseDishes(record.dishes);
  if (!dishes.ok) return dishes;

  return {
    ok: true,
    value: {
      name,
      nameEn,
      slug,
      districtId: districtId as DistrictId,
      address: text(record.address, 200),
      lat: point.lat,
      lng: point.lng,
      hours: text(record.hours, 400),
      established: text(record.established, 20),
      excerpt: text(record.excerpt, 280),
      story: text(record.story, 8000),
      motif: motif as Motif,
      tone: tone as Tone,
      videoTitle: text(record.videoTitle, 120),
      videoDuration: normalizeDuration(text(record.videoDuration, 8)),
      videoUrl,
      coverImage,
      gallery: gallery.value,
      owner: text(record.owner, 80),
      contact: text(record.contact, 160),
      visitedOn,
      dishes: dishes.value,
      publication: publication as PublicationStatus,
      verification: verification as VerificationStatus,
    },
  };
}

export function parseRestaurantPatch(
  current: Restaurant,
  raw: unknown,
): { ok: true; value: RestaurantInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "資料不完整。" };
  const base = inputFromRestaurant(current);
  const record = raw as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base)) {
    if (key in record) merged[key] = record[key];
  }
  return parseRestaurantInput(merged);
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isHttp(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function allowedAsset(value: string) {
  return MEDIA_PATH.test(value) || isHttp(value);
}

function coordinates(
  latValue: unknown,
  lngValue: unknown,
): { ok: true; lat: number | null; lng: number | null } | { ok: false; error: string } {
  const lat = optionalNumber(latValue);
  const lng = optionalNumber(lngValue);
  if (lat === "bad" || lng === "bad") return { ok: false, error: "經緯度需要是數字。" };
  if (lat === null && lng === null) return { ok: true, lat: null, lng: null };
  if (lat === null || lng === null) return { ok: false, error: "緯度和經度要一起填。" };
  if (lng < 113.78 || lng > 114.5 || lat < 22.12 || lat > 22.6) {
    return { ok: false, error: "座標需要落在香港範圍內。" };
  }
  return { ok: true, lat, lng };
}

function optionalNumber(value: unknown): number | null | "bad" {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(number)) return "bad";
  return number;
}

function stringList(
  value: unknown,
  max: number,
  itemMax: number,
): { ok: true; value: string[] } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") return { ok: true, value: [] };
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\n+/)
      : null;
  if (!source) return { ok: false, error: "相簿格式不正確。" };
  const items = source.map((item) => text(item, itemMax)).filter(Boolean);
  if (items.length > max) return { ok: false, error: `相簿最多 ${max} 張。` };
  return { ok: true, value: items };
}

function parseDishes(value: unknown): { ok: true; value: Dish[] } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, value: [] };
  if (!Array.isArray(value)) return { ok: false, error: "招牌格式不正確。" };
  if (value.length > 24) return { ok: false, error: "招牌太多。" };
  const dishes: Dish[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return { ok: false, error: "招牌格式不正確。" };
    const record = item as Record<string, unknown>;
    const name = text(record.name, 40);
    if (!name) continue;
    dishes.push({ name, note: text(record.note, 80) });
  }
  return { ok: true, value: dishes };
}
