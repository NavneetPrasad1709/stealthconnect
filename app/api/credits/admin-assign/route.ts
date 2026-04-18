import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { adminDb, addCredits, getProfile } from "@/lib/admin-db";

interface Payload {
  target_email: string;
  amount:       number;
  note?:        string;
}

export async function POST(req: NextRequest) {
  try {
    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    /* ── Verify caller is admin ────────────────────────────────── */
    const caller = await getProfile(userId);
    if (!caller || caller.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const body = await req.json() as Payload;
    const { target_email, amount, note } = body;

    if (!target_email || !amount || amount < 1) {
      return NextResponse.json({ error: "target_email and amount (≥1) required" }, { status: 400 });
    }

    /* ── Find target user by email ─────────────────────────────── */
    const { data: target } = await adminDb()
      .from("profiles")
      .select("id, email, full_name, credits")
      .eq("email", target_email)
      .maybeSingle();

    if (!target) {
      return NextResponse.json(
        { error: `No user found with email: ${target_email}` },
        { status: 404 }
      );
    }

    const targetProfile = target as {
      id: string; email: string; full_name: string | null; credits: number;
    };

    /* ── Assign credits ─────────────────────────────────────────── */
    await addCredits(
      targetProfile.id,
      amount,
      note ?? `Admin grant of ${amount} credit${amount > 1 ? "s" : ""} by ${caller.email}`,
      userId,
    );

    return NextResponse.json({
      success:        true,
      target_email,
      amount_added:   amount,
      credits_before: targetProfile.credits,
      credits_after:  targetProfile.credits + amount,
    });
  } catch (err) {
    console.error("Admin assign credits error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
