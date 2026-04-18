import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { adminDb } from "@/lib/admin-db";

export async function GET() {
  try {
    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await adminDb()
      .from("orders")
      .select(
        "id, contact_type, input_type, quantity, amount_paid, " +
        "email_draft_requested, status, created_at, delivered_at, " +
        "paypal_order_id, linkedin_urls"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders list error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    return NextResponse.json({ orders: data ?? [] });
  } catch (err) {
    console.error("Orders list error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
