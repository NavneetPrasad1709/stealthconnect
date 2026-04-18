import { NextRequest, NextResponse } from "next/server";
import { adminDb, addCredits, getProfile } from "@/lib/admin-db";

export async function POST(req: NextRequest) {
  // Auth: only admins can assign credits
  const adminUserId = req.headers.get("x-user-id");
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const adminProfile = await getProfile(adminUserId);
  if (!adminProfile || adminProfile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = adminDb();
  const { email, amount, note } = await req.json() as {
    email: string;
    amount: number;
    note?: string;
  };

  if (!email || !amount || amount < 1) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // look up user by email
  const { data: profile, error: profileErr } = await (db as any)
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const adminId = adminUserId;
  try {
    await addCredits(profile.id, amount, note ?? "Admin grant", adminId);
  } catch {
    return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
