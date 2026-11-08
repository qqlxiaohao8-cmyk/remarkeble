import type { Metadata } from "next";
import { AdminMedia } from "@/components/screens/admin-media";

export const metadata: Metadata = {
  title: "圖版",
};

export default function MediaPage() {
  return <AdminMedia />;
}
