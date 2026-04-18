import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/admin-db";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export default async function DashboardAdminPage() {
  const h      = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/login");

  const profile = await getProfile(userId);
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return <AdminDashboard />;
}
