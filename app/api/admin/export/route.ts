import { NextRequest, NextResponse } from "next/server";
import { adminDb, getProfile } from "@/lib/admin-db";

export async function GET(req: NextRequest) {
  // Auth: admin only
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await getProfile(userId);
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = adminDb();

  const { data, error } = await (db as any)
    .from("orders")
    .select(
      `id, created_at, status, contact_type, quantity, amount_paid, email_draft_requested,
       profiles!orders_user_id_fkey(email, full_name)`
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as any[];

  const header = ["Order ID", "Date", "User Email", "User Name", "Contact Type", "Quantity", "Amount Paid ($)", "AI Draft", "Status"];
  const csvRows = [
    header.join(","),
    ...rows.map((r) => [
      r.id,
      new Date(r.created_at).toISOString().split("T")[0],
      r.profiles?.email ?? "",
      `"${(r.profiles?.full_name ?? "").replace(/"/g, '""')}"`,
      r.contact_type,
      r.quantity,
      r.amount_paid,
      r.email_draft_requested ? "Yes" : "No",
      r.status,
    ].join(",")),
  ];

  const csv = csvRows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
