import type { Metadata } from "next";
import { AdminRestaurants } from "@/components/screens/admin-restaurants";

export const metadata: Metadata = {
  title: "餐廳",
};

export default function RestaurantsPage() {
  return <AdminRestaurants />;
}
