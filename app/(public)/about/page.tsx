import type { Metadata } from "next";
import { AboutScreen } from "@/components/screens/about-screen";

export const metadata: Metadata = {
  title: "關於",
};

export default function AboutPage() {
  return <AboutScreen />;
}
