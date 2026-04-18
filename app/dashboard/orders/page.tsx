import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { OrdersView } from "@/components/dashboard/Orders/OrdersView";

export const metadata = { title: "My Orders" };

type Order = {
  id:                    string;
  contact_type:          "email" | "phone" | "both";
  input_type:            "linkedin_url" | "csv_upload" | "manual";
  quantity:              number;
  amount_paid:           number;
  email_draft_requested: boolean;
  status:                "pending" | "processing" | "delivered" | "failed" | "refunded";
  created_at:            string;
  delivered_at:          string | null;
  linkedin_urls:         string[];
};

export default async function OrdersPage() {
  const h      = await headers();
  const userId = h.get("x-user-id")!;

  const { data } = await createAdminClient()
    .from("orders")
    .select(
      "id,contact_type,input_type,quantity,amount_paid," +
      "email_draft_requested,status,created_at,delivered_at,linkedin_urls"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <OrdersView orders={(data ?? []) as Order[]} />;
}
