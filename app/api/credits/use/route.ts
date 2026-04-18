import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { deductCredits, getProfile } from "@/lib/admin-db";

export async function POST() {
  try {
    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await getProfile(userId);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    if (profile.credits < 1) {
      return NextResponse.json({ error: "No credits remaining" }, { status: 400 });
    }

    const ok = await deductCredits(userId, 1);
    if (!ok) return NextResponse.json({ error: "Failed to deduct credit" }, { status: 500 });

    return NextResponse.json({
      success:        true,
      credits_remaining: profile.credits - 1,
    });
  } catch (err) {
    console.error("Credits use error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
