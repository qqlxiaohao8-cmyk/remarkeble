import type { Metadata } from "next";
import { RestaurantForm } from "@/components/admin/restaurant-form";

export const metadata: Metadata = {
  title: "入藏",
};

export default function NewRestaurantPage() {
  return <RestaurantForm mode="create" />;
}
