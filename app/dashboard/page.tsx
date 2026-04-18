import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import DashboardAnimated from "@/components/dashboard/DashboardAnimated";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your StealthConnect AI credits, orders, and account.",
  robots: { index: false, follow: false },
};

type Order = {
  id:           string;
  contact_type: "email" | "phone" | "both";
  quantity:     number;
  status:       "pending" | "processing" | "delivered" | "failed" | "refunded";
  created_at:   string;
  amount_paid:  number;
};

export default async function DashboardPage() {
  const headersList = await headers();
  const userId      = headersList.get("x-user-id");
  const userEmail   = headersList.get("x-user-email");

  const supabase = createAdminClient();

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("credits, full_name")
    .eq("id", userId!)
    .maybeSingle();

  const profile   = profileRaw as { credits: number; full_name: string | null } | null;
  const credits   = profile?.credits ?? 0;
  const fullName  = profile?.full_name ?? userEmail ?? "User";
  const firstName = fullName.split(" ")[0];

  const { data: ordersRaw } = await supabase
    .from("orders")
    .select("id, contact_type, quantity, status, created_at, amount_paid")
    .eq("user_id", userId!)
    .order("created_at", { ascending: false });

  const orders: Order[] = (ordersRaw ?? []) as Order[];

  const totalOrders     = orders.length;
  const pendingOrders   = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const recentOrders    = orders.slice(0, 5);

  return (
    <DashboardAnimated
      firstName={firstName}
      credits={credits}
      totalOrders={totalOrders}
      pendingOrders={pendingOrders}
      deliveredOrders={deliveredOrders}
      recentOrders={recentOrders}
    />
  );
}
