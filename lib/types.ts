import type { DistrictId } from "@/lib/districts";

export const MOTIFS = [
  "tea",
  "noodles",
  "congee",
  "seafood",
  "cart",
  "dessert",
  "roast",
  "egg",
  "dried",
  "stilt",
  "rice",
  "stall",
] as const;

export type Motif = (typeof MOTIFS)[number];

export const MOTIF_LABELS: Record<Motif, string> = {
  tea: "奶茶",
  noodles: "麵",
  congee: "粥",
  seafood: "海鮮",
  cart: "車仔",
  dessert: "糖水",
  roast: "燒味",
  egg: "蛋撻",
  dried: "海味",
  stilt: "棚屋",
  rice: "飯",
  stall: "大牌檔",
};

export const TONES = ["silver", "sepia", "cyan", "night"] as const;

export type Tone = (typeof TONES)[number];

export const TONE_LABELS: Record<Tone, string> = {
  silver: "銀鹽",
  sepia: "褐調",
  cyan: "青印",
  night: "夜色",
};

export type Dish = {
  name: string;
  note: string;
};

export const PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const VERIFICATION_STATUSES = ["unverified", "visited", "verified"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  districtId: DistrictId;
  address: string;
  lat?: number | null;
  lng?: number | null;
  hours: string;
  established: string;
  excerpt: string;
  story: string;
  motif: Motif;
  tone: Tone;
  videoTitle: string;
  videoDuration: string;
  videoUrl?: string;
  coverImage?: string;
  gallery?: string[];
  owner?: string;
  contact?: string;
  visitedOn?: string;
  dishes: Dish[];
  verified: boolean;
  published: boolean;
  publication?: PublicationStatus;
  verification?: VerificationStatus;
  addedAt: string;
  updatedAt?: string;
  page: number;
  catalogNo: string;
};

export type Draft = {
  name: string;
  nameEn: string;
  slug: string;
  districtId: DistrictId;
  address: string;
  lat: string;
  lng: string;
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
  gallery: string;
  owner: string;
  contact: string;
  visitedOn: string;
  dishes: Dish[];
  publication: PublicationStatus;
  verification: VerificationStatus;
};
