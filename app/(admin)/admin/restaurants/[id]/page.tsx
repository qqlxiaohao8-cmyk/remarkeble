import { Suspense } from "react";
import type { Metadata } from "next";
import { PageFallback } from "@/components/page-fallback";
import { EditScreen } from "@/components/screens/edit-screen";
import { SEED } from "@/lib/seed";

export const metadata: Metadata = {
  title: "編輯",
};

export function generateStaticParams() {
  return SEED.map((restaurant) => ({ id: restaurant.id }));
}

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <EditRoute params={params} />
    </Suspense>
  );
}

async function EditRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditScreen id={id} />;
}
