import { NextRequest, NextResponse } from "next/server";
import { adminDb, getProfile } from "@/lib/admin-db";

async function requireAdmin(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;
  const profile = await getProfile(userId);
  if (!profile || profile.role !== "admin") return null;
  return profile;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = adminDb();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 20;
  const from = (page - 1) * limit;

  let query = (db as any)
    .from("orders")
    .select(
      `id, created_at, status, contact_type, quantity, amount_paid, email_draft_requested,
       profiles!orders_user_id_fkey(email, full_name)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (email) {
    // filter via joined profile email
    query = query.ilike("profiles.email", `%${email}%`);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orders: data ?? [], total: count ?? 0, page, limit });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = adminDb();
  const { id, status } = await req.json() as { id: string; status: string };

  const allowed = ["pending", "processing", "delivered", "failed", "refunded"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await (db as any)
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
