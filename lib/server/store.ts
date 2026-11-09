import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { folio } from "@/lib/format";
import { parseRestaurantInput, parseRestaurantPatch, type RestaurantInput } from "@/lib/restaurant-input";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { SEED } from "@/lib/seed";
import { normalizeRestaurant } from "@/lib/status";
import type { Restaurant } from "@/lib/types";

export type AdminRole = "super" | "admin";

export type AdminPublic = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
};

type AdminRecord = AdminPublic & {
  passwordHash: string;
};

type ArchiveFile = {
  restaurants: Restaurant[];
  admins: AdminRecord[];
};

const FILE = path.join(process.cwd(), "data", "archive.json");

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(task: () => Promise<T>) {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function toPublic(admin: AdminRecord): AdminPublic {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    createdAt: admin.createdAt,
  };
}

function isAdmin(value: unknown): value is AdminRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as AdminRecord;
  return (
    typeof record.id === "string" &&
    typeof record.email === "string" &&
    typeof record.name === "string" &&
    (record.role === "super" || record.role === "admin") &&
    typeof record.passwordHash === "string" &&
    typeof record.createdAt === "string"
  );
}

async function load(): Promise<ArchiveFile> {
  await mkdir(path.dirname(FILE), { recursive: true });
  let raw: string | null = null;
  try {
    raw = await readFile(FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (raw === null) {
    const created: ArchiveFile = {
      restaurants: SEED.map((restaurant) => normalizeRestaurant(restaurant)),
      admins: [],
    };
    await bootstrap(created);
    await persist(created);
    return created;
  }
  const parsed = JSON.parse(raw) as { restaurants?: unknown; admins?: unknown };
  const restaurants = Array.isArray(parsed.restaurants)
    ? parsed.restaurants.filter(isStoredRestaurant).map((restaurant) => normalizeRestaurant(restaurant))
    : SEED.map((restaurant) => normalizeRestaurant(restaurant));
  const data: ArchiveFile = {
    restaurants,
    admins: Array.isArray(parsed.admins) ? parsed.admins.filter(isAdmin) : [],
  };
  const before = data.admins.length;
  await bootstrap(data);
  if (data.admins.length !== before) await persist(data);
  return data;
}

function isStoredRestaurant(value: unknown): value is Restaurant {
  if (!value || typeof value !== "object") return false;
  const record = value as Restaurant;
  return typeof record.id === "string" && typeof record.slug === "string" && typeof record.name === "string";
}

async function bootstrap(data: ArchiveFile) {
  if (data.admins.length > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10) return;
  data.admins.push({
    id: randomUUID(),
    email,
    name: "主管",
    role: "super",
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });
}

async function persist(data: ArchiveFile) {
  const temporary = `${FILE}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2));
  await rename(temporary, FILE);
}

export function archiveConfigured() {
  return withLock(async () => {
    const data = await load();
    return data.admins.length > 0;
  });
}

export function listPublicRestaurants() {
  return withLock(async () => {
    const data = await load();
    return data.restaurants.filter((restaurant) => restaurant.published);
  });
}

export function listRestaurants() {
  return withLock(async () => {
    const data = await load();
    return data.restaurants;
  });
}

export function readAdmin(id: string) {
  return withLock(async () => {
    const data = await load();
    const admin = data.admins.find((item) => item.id === id);
    return admin ? toPublic(admin) : null;
  });
}

export function listAdmins() {
  return withLock(async () => {
    const data = await load();
    return data.admins.map(toPublic);
  });
}

export async function authenticate(email: string, password: string) {
  const admin = await withLock(async () => {
    const data = await load();
    return data.admins.find((item) => item.email === email.trim().toLowerCase()) ?? null;
  });
  if (!admin) {
    await hashPassword(password);
    return null;
  }
  const matches = await verifyPassword(password, admin.passwordHash);
  return matches ? toPublic(admin) : null;
}

export function createRestaurant(input: RestaurantInput) {
  return withLock(async () => {
    const data = await load();
    if (data.restaurants.some((restaurant) => restaurant.slug === input.slug)) {
      return { error: "這個網址代號已經有人用了。" as const };
    }
    const page = data.restaurants.reduce((max, restaurant) => Math.max(max, restaurant.page), 0) + 1;
    const now = new Date().toISOString();
    const restaurant = normalizeRestaurant({
      ...input,
      id: randomUUID(),
      page,
      catalogNo: `HK-${input.established || "0000"}-${folio(page)}`,
      addedAt: now,
      updatedAt: now,
      published: input.publication === "published",
      verified: input.verification === "verified",
    });
    data.restaurants.push(restaurant);
    await persist(data);
    return { restaurant, restaurants: data.restaurants };
  });
}

export function updateRestaurant(id: string, patch: unknown) {
  return withLock(async () => {
    const data = await load();
    const current = data.restaurants.find((restaurant) => restaurant.id === id);
    if (!current) return { error: "找不到這間餐廳。" as const };
    const parsed = parseRestaurantPatch(current, patch);
    if (!parsed.ok) return { error: parsed.error };
    if (data.restaurants.some((restaurant) => restaurant.slug === parsed.value.slug && restaurant.id !== id)) {
      return { error: "這個網址代號已經有人用了。" as const };
    }
    const restaurant = normalizeRestaurant({
      ...current,
      ...parsed.value,
      updatedAt: new Date().toISOString(),
      published: parsed.value.publication === "published",
      verified: parsed.value.verification === "verified",
    });
    data.restaurants = data.restaurants.map((item) => (item.id === id ? restaurant : item));
    await persist(data);
    await removeUnusedMedia(data.restaurants, mediaIds(current).filter((item) => !mediaIds(restaurant).includes(item)));
    return { restaurant, restaurants: data.restaurants };
  });
}

export function deleteRestaurant(id: string) {
  return withLock(async () => {
    const data = await load();
    const current = data.restaurants.find((restaurant) => restaurant.id === id);
    if (!current) return { error: "找不到這間餐廳。" as const };
    data.restaurants = data.restaurants.filter((restaurant) => restaurant.id !== id);
    await persist(data);
    await removeUnusedMedia(data.restaurants, mediaIds(current));
    return { restaurants: data.restaurants };
  });
}

export function createAdmin(input: { email: string; name: string; password: string; role: AdminRole }) {
  return withLock(async () => {
    const data = await load();
    const email = input.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "電郵不正確。" as const };
    if (input.password.length < 10) return { error: "密碼至少 10 個字元。" as const };
    if (input.role !== "admin" && input.role !== "super") return { error: "角色不正確。" as const };
    if (data.admins.some((admin) => admin.email === email)) return { error: "這個電郵已經是管理員。" as const };
    const admin: AdminRecord = {
      id: randomUUID(),
      email,
      name: input.name.trim().slice(0, 40) || email.split("@")[0],
      role: input.role,
      passwordHash: await hashPassword(input.password),
      createdAt: new Date().toISOString(),
    };
    data.admins.push(admin);
    await persist(data);
    return { admin: toPublic(admin), admins: data.admins.map(toPublic) };
  });
}

export function deleteAdmin(actorId: string, id: string) {
  return withLock(async () => {
    const data = await load();
    if (actorId === id) return { error: "不能移除自己的帳戶。" as const };
    const target = data.admins.find((admin) => admin.id === id);
    if (!target) return { error: "找不到這個帳戶。" as const };
    const supers = data.admins.filter((admin) => admin.role === "super");
    if (target.role === "super" && supers.length <= 1) return { error: "至少要留下一位主管。" as const };
    data.admins = data.admins.filter((admin) => admin.id !== id);
    await persist(data);
    return { admins: data.admins.map(toPublic) };
  });
}

export function restaurantReferencesMedia(restaurants: Restaurant[], id: string) {
  const pathName = `/api/media/${id}`;
  return restaurants.some((restaurant) => restaurant.coverImage === pathName || restaurant.gallery?.includes(pathName));
}

function mediaIds(restaurant: Restaurant) {
  const ids: string[] = [];
  for (const value of [restaurant.coverImage, ...(restaurant.gallery ?? [])]) {
    const match = value?.match(/^\/api\/media\/([a-f0-9]{32})$/);
    if (match) ids.push(match[1]);
  }
  return ids;
}

async function removeUnusedMedia(restaurants: Restaurant[], ids: string[]) {
  const { unlink } = await import("node:fs/promises");
  for (const id of ids) {
    if (restaurantReferencesMedia(restaurants, id)) continue;
    for (const extension of ["jpg", "png", "webp", "gif"]) {
      await unlink(path.join(process.cwd(), "data", "media", `${id}.${extension}`)).catch(() => undefined);
    }
  }
}

export function acceptRestaurant(raw: unknown) {
  return parseRestaurantInput(raw);
}
