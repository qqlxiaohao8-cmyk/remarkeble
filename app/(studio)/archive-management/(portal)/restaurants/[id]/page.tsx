import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { EditScreen } from "@/components/screens/edit-screen";

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
