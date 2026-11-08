import { Suspense } from "react";
import type { Metadata } from "next";
import { PageFallback } from "@/components/page-fallback";
import { StoryScreen } from "@/components/screens/story-screen";
import { SEED } from "@/lib/seed";

export function generateStaticParams() {
  return SEED.map((restaurant) => ({ slug: restaurant.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = SEED.find((item) => item.slug === slug);
  return { title: restaurant?.name ?? "餐廳" };
}

export default function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <StoryRoute params={params} />
    </Suspense>
  );
}

async function StoryRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StoryScreen slug={slug} />;
}
