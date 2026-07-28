import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  adminDb, deductCredits, getProfile, getPayPalToken, PAYPAL_BASE,
  fetchWithTimeout, getPayPalIntent, consumePayPalIntent, recordPendingAlert,
} from "@/lib/admin-db";
import { sendOrderConfirmation, sendTeamNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { quoteCents } from "@/lib/pricing";
import { isAllowedOrigin } from "@/lib/origin";

interface OrderPayload {
  contact_type:          "email" | "phone" | "both";
  linkedin_urls:         string[];
  email_draft_requested: boolean;
  amount_paid:           number;
  paypal_order_id?:      string;
  use_credits?:          boolean;
  input_type?:           "single" | "csv";
}

const MAX_QUANTITY = 1000; // F-PAY-04: cap order size on both credit + PayPal paths

export async function POST(req: NextRequest) {
  try {
    // SEC-M3: reject cross-site mutations. F-PAY-04: bound request body size.
    if (!isAllowedOrigin(req.headers)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (Number(req.headers.get("content-length") ?? 0) > 256 * 1024) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!rateLimit(`order-create:${userId}`, 10, 0.5)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json() as OrderPayload;
    const {
      contact_type, linkedin_urls, email_draft_requested,
      amount_paid, paypal_order_id, use_credits = false,
      input_type = "single",
    } = body;

    if (!contact_type || !linkedin_urls?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (linkedin_urls.length > MAX_QUANTITY) { // F-PAY-04
      return NextResponse.json({ error: `Too many URLs, max ${MAX_QUANTITY} per order` }, { status: 400 });
    }
    if (!["email", "phone", "both"].includes(contact_type)) {
      return NextResponse.json({ error: "Invalid contact type" }, { status: 400 });
    }
    if (!["single", "csv"].includes(input_type)) {
      return NextResponse.json({ error: "Invalid input type" }, { status: 400 });
    }

    /* Enforce: exactly one payment method */
    const hasPayPal = !!paypal_order_id;
    if (use_credits === hasPayPal) {
      return NextResponse.json(
        { error: use_credits ? "Cannot mix credits with PayPal" : "Payment required" },
        { status: 400 }
      );
    }

    /* Server-side LinkedIn URL validation */
    const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%-]{3,100}\/?$/;
    const invalidUrl = linkedin_urls.find((u) => !LINKEDIN_RE.test(u));
    if (invalidUrl) {
      return NextResponse.json({ error: "Invalid LinkedIn URL detected" }, { status: 400 });
    }

    const db       = adminDb();
    const quantity = linkedin_urls.length;

    /* ── Server-authoritative price (integer cents) — canonical pricing ── */
    const expectedCents = use_credits
      ? 0
      : quoteCents({ contactType: contact_type, qty: quantity, emailDraft: email_draft_requested });
    const paidCents = Math.round(amount_paid * 100);

    if (!use_credits && paidCents !== expectedCents) { // FP-12: exact integer-cents, no ±2¢ slack
      return NextResponse.json(
        { error: `Amount mismatch. Expected $${(expectedCents / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    /* ── PayPal verification + intent ownership/match ── */
    if (hasPayPal) {
      const intent = await getPayPalIntent(paypal_order_id!);
      if (!intent || intent.user_id !== userId) {
        console.error("Order rejected: paypal_intent missing or owner mismatch", { paypal_order_id, userId });
        return NextResponse.json({ error: "Order not recognized" }, { status: 403 });
      }
      if (
        intent.contact_type !== contact_type ||
        intent.quantity     !== quantity     ||
        intent.email_draft  !== email_draft_requested ||
        intent.expected_cents !== expectedCents
      ) {
        console.error("Order rejected: intent params do not match request", { paypal_order_id, intent, body });
        return NextResponse.json({ error: "Order details changed since payment, please retry" }, { status: 400 });
      }

      try {
        const token = await getPayPalToken();
        const ppRes = await fetchWithTimeout(
          `${PAYPAL_BASE}/v2/checkout/orders/${paypal_order_id}`,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
          15000,
        );
        const ppOrder = await ppRes.json() as {
          status: string;
          purchase_units?: Array<{ amount: { value: string } }>;
        };
        if (ppOrder.status !== "COMPLETED") {
          return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
        }
        const paidAmt = parseFloat(ppOrder.purchase_units?.[0]?.amount?.value ?? "0");
        if (Math.round(paidAmt * 100) !== expectedCents) { // FP-12: exact integer-cents
          return NextResponse.json({ error: "Payment amount mismatch" }, { status: 402 });
        }
      } catch (e) {
        const isAbort = (e as Error)?.name === "AbortError";
        return NextResponse.json(
          { error: isAbort ? "Payment verification timed out, retry shortly" : "Could not verify payment" },
          { status: 502 }
        );
      }
    }

    /* ── Idempotency: same paypal_order_id → return existing order ── */
    if (paypal_order_id) {
      const { data: existing } = await db
        .from("orders")
        .select("id, user_id")
        .eq("paypal_order_id", paypal_order_id as never)
        .maybeSingle();
      if (existing) {
        const ex = existing as { id: string; user_id: string };
        if (ex.user_id !== userId) {
          return NextResponse.json({ error: "Order already claimed" }, { status: 409 });
        }
        return NextResponse.json({ orderId: ex.id, idempotent: true });
      }
    }

    /* ── Profile fetch (for emails) ── */
    const profile = await getProfile(userId);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    /* ── Create order row ── */
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
      if (paypal_order_id) {
        console.error(
          "CRITICAL: PayPal captured but order insert FAILED.",
          "paypal_order_id=", paypal_order_id,
          "user_id=", userId,
          "amount=", amount_paid,
          "error=", error,
        );
        await recordPendingAlert({
          user_id: userId,
          reason:  "PayPal captured but order insert failed (orphan payment)",
          details: { paypal_order_id, amount_paid, contact_type, quantity, error: String(error.message ?? error) },
        }).catch((e) => console.error("pending_alerts insert failed:", e));

        void sendTeamNotification({
          orderId:      `ORPHAN-${paypal_order_id}`,
          userEmail:    profile.email,
          userName:     profile.full_name ?? profile.email,
          contactType:  contact_type,
          quantity,
          amountPaid:   amount_paid,
          usedCredits:  false,
          linkedinUrls: linkedin_urls,
          emailDraft:   email_draft_requested,
        }).catch((e) => console.error("Orphan alert email failed:", e));

        return NextResponse.json(
          {
            error: "Payment received but order could not be saved. Our team has been notified. Please contact support with this reference.",
            paypal_order_id,
          },
          { status: 500 }
        );
      }
      console.error("Order insert error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderId = (order as { id: string }).id;

    /* ── Deduct credits AFTER order row exists ── */
    if (use_credits) {
      let creditOk = false;
      try {
        creditOk = await deductCredits(userId, quantity);
      } catch (e) {
        console.error("Credit deduction threw:", e);
      }
      if (!creditOk) {
        await db.from("orders").delete().eq("id", orderId as never);
        return NextResponse.json(
          { error: `Not enough credits. Need ${quantity}.` },
          { status: 400 }
        );
      }
    }

    /* ── Mark PayPal intent consumed (best-effort) ── */
    if (paypal_order_id) {
      consumePayPalIntent(paypal_order_id).catch((e) =>
        console.error("Failed to mark paypal_intent consumed:", e)
      );
    }

    /* ── Emails ── */
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

    /* Customer order confirmation — AWAITED so a Resend failure is captured as a
       pending_alert. Serverless can freeze the instance after the response is sent,
       so fire-and-forget could silently drop the customer's receipt. */
    try {
      const conf = (await sendOrderConfirmation(emailData)) as { error?: unknown } | null;
      if (conf?.error) {
        throw new Error(typeof conf.error === "string" ? conf.error : JSON.stringify(conf.error));
      }
    } catch (e) {
      console.error("Order confirmation email failed for order", orderId, e);
      await recordPendingAlert({
        order_id: orderId,
        user_id:  userId,
        reason:   "Order confirmation email failed",
        details:  { error: String((e as Error)?.message ?? e) },
      }).catch((err) => console.error("pending_alerts insert failed:", err));
    }

    /* Team notification: if it fails, the order would otherwise sit unprocessed.
       Surface it as a pending alert so admin dashboard catches it. */
    try {
      await sendTeamNotification(emailData);
    } catch (e) {
      console.error("CRITICAL: Team notification failed for order", orderId, e);
      await recordPendingAlert({
        order_id: orderId,
        user_id:  userId,
        reason:   "Team notification email failed",
        details:  { error: String((e as Error)?.message ?? e) },
      }).catch((err) => console.error("pending_alerts insert failed:", err));
    }

    return NextResponse.json({ orderId });
  } catch (err) {
    console.error("Order create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
