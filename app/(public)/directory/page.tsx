import type { Metadata } from "next";
import { DirectoryScreen } from "@/components/screens/directory-screen";

export const metadata: Metadata = {
  title: "目錄",
};

export default function DirectoryPage() {
  return <DirectoryScreen />;
}
