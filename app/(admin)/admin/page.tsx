import type { Metadata } from "next";
import { AdminDashboard } from "@/components/screens/admin-dashboard";

export const metadata: Metadata = {
  title: "檔案室",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
