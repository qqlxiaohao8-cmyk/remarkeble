import type { Metadata } from "next";
import { AdminPublication } from "@/components/screens/admin-publication";

export const metadata: Metadata = {
  title: "出版",
};

export default function PublicationPage() {
  return <AdminPublication />;
}
