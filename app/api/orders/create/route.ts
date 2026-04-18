import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { adminDb, deductCredits, getProfile } from "@/lib/admin-db";
import { sendOrderConfirmation, sendTeamNotification } from "@/lib/email";

interface OrderPayload {
  contact_type:          "email" | "phone" | "both";
  linkedin_urls:         string[];
  email_draft_requested: boolean;
  amount_paid:           number;
  paypal_order_id?:      string;
  use_credits?:          boolean;
  input_type?:           "single" | "csv";
}

export async function POST(req: NextRequest) {
  try {
    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as OrderPayload;
    const {
      contact_type, linkedin_urls, email_draft_requested,
      amount_paid, paypal_order_id, use_credits = false,
      input_type = "single",
    } = body;

    if (!contact_type || !linkedin_urls?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db       = adminDb();
    const quantity = linkedin_urls.length;

    /* ── Server-side price validation ───────────────────────── */
    const BASE_PRICE: Record<string, number> = { email: 0.20, phone: 1.00, both: 1.20 };
    if (!BASE_PRICE[contact_type]) {
      return NextResponse.json({ error: "Invalid contact type" }, { status: 400 });
    }
    const expectedAmount = use_credits
      ? 0
      : parseFloat(
          (quantity * BASE_PRICE[contact_type] + (email_draft_requested ? quantity * 1.00 : 0)).toFixed(2)
        );
    const tolerance = 0.02; // rounding tolerance
    if (!use_credits && Math.abs(amount_paid - expectedAmount) > tolerance) {
      return NextResponse.json(
        { error: `Amount mismatch. Expected $${expectedAmount.toFixed(2)}` },
        { status: 400 }
      );
    }

    /* ── Fetch profile for emails ────────────────────────────── */
    const profile = await getProfile(userId);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    /* ── Create order FIRST, then deduct credits ─────────────── */
    const { data: order, error } = await db
      .from("orders")
      .insert({
        user_id:               userId,
        input_type,
        linkedin_urls,
        contact_type,
        quantity,
        amount_paid,
        paypal_order_id:       paypal_order_id ?? null,
        email_draft_requested,
        status:                "pending",
      } as never)
      .select("id")
      .single();

    if (error) {
      console.error("Order insert error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderId = (order as { id: string }).id;

    /* ── Deduct credits AFTER order is created ───────────────── */
    if (use_credits) {
      const ok = await deductCredits(userId, quantity);
      if (!ok) {
        // Rollback: delete the order we just created
        await db.from("orders").delete().eq("id", orderId as never);
        return NextResponse.json(
          { error: `Not enough credits. Need ${quantity}.` },
          { status: 400 }
        );
      }
    }

    /* ── Send emails (non-blocking — don't fail order on email error) */
    const emailData = {
      orderId,
      userEmail:    profile.email,
      userName:     profile.full_name ?? profile.email,
      contactType:  contact_type,
      quantity,
      amountPaid:   amount_paid,
      usedCredits:  use_credits,
      linkedinUrls: linkedin_urls,
      emailDraft:   email_draft_requested,
    };

    void Promise.allSettled([
      sendOrderConfirmation(emailData),
      sendTeamNotification(emailData),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Email ${i === 0 ? "confirmation" : "team"} failed:`, r.reason);
        }
      });
    });

    return NextResponse.json({ orderId });
  } catch (err) {
    console.error("Order create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
