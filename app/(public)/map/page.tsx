import { Suspense } from "react";
import type { Metadata } from "next";
import { PageFallback } from "@/components/page-fallback";
import { MapScreen } from "@/components/screens/map-screen";

export const metadata: Metadata = {
  title: "地圖",
};

export default function MapPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <MapScreen />
    </Suspense>
  );
}
