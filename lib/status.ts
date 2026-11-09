import type { PublicationStatus, Restaurant, VerificationStatus } from "@/lib/types";

export function publicationOf(restaurant: Pick<Restaurant, "publication" | "published">): PublicationStatus {
  if (restaurant.publication) return restaurant.publication;
  return restaurant.published ? "published" : "draft";
}

export function verificationOf(restaurant: Pick<Restaurant, "verification" | "verified">): VerificationStatus {
  if (restaurant.verification) return restaurant.verification;
  return restaurant.verified ? "verified" : "unverified";
}

export function isPublicRestaurant(restaurant: Pick<Restaurant, "publication" | "published">) {
  return publicationOf(restaurant) === "published";
}

export const PUBLICATION_LABELS: Record<PublicationStatus, string> = {
  draft: "草稿",
  published: "已出版",
  archived: "封存",
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  unverified: "未核實",
  visited: "已到訪",
  verified: "已核實",
};

export function normalizeRestaurant(restaurant: Restaurant): Restaurant {
  const publication = publicationOf(restaurant);
  const verification = verificationOf(restaurant);
  return {
    ...restaurant,
    nameEn: restaurant.nameEn ?? "",
    lat: typeof restaurant.lat === "number" ? restaurant.lat : null,
    lng: typeof restaurant.lng === "number" ? restaurant.lng : null,
    videoUrl: restaurant.videoUrl ?? "",
    coverImage: restaurant.coverImage ?? "",
    gallery: Array.isArray(restaurant.gallery) ? restaurant.gallery : [],
    owner: restaurant.owner ?? "",
    contact: restaurant.contact ?? "",
    visitedOn: restaurant.visitedOn ?? "",
    publication,
    verification,
    published: publication === "published",
    verified: verification === "verified",
    updatedAt: restaurant.updatedAt || restaurant.addedAt,
  };
}
