import type { Metadata } from "next";
import { AdminVerification } from "@/components/screens/admin-verification";

export const metadata: Metadata = {
  title: "核實",
};

export default function VerificationPage() {
  return <AdminVerification />;
}
