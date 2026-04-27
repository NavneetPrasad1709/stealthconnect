import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getPayPalToken, PAYPAL_BASE, fetchWithTimeout, getPayPalIntent,
} from "@/lib/admin-db";
import { rateLimit } from "@/lib/rate-limit";

const PAYPAL_ERROR_MSGS: Record<string, string> = {
  INSTRUMENT_DECLINED:        "Card declined — try a different payment method.",
  PAYER_ACTION_REQUIRED:      "Action required — re-open PayPal and confirm.",
  CARD_REFUSED:               "Card refused by issuer.",
  COMPLIANCE_VIOLATION:       "Payment blocked for compliance reasons.",
  PAYEE_BLOCKED_TRANSACTION:  "Transaction blocked.",
  TRANSACTION_REFUSED:        "Transaction refused — try another method.",
  AUTHORIZATION_DENIED:       "Authorization denied — try another method.",
  PAYER_CANNOT_PAY:           "Payer cannot complete this payment.",
};

export async function POST(req: NextRequest) {
  try {
    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!rateLimit(`paypal-capture:${userId}`, 5, 0.5)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { orderID } = await req.json() as { orderID: string };
    if (!orderID || typeof orderID !== "string") {
      return NextResponse.json({ error: "orderID required" }, { status: 400 });
    }

    /* Ownership check — only the user who created this PayPal order may capture it */
    const intent = await getPayPalIntent(orderID);
    if (!intent || intent.user_id !== userId) {
      console.error("Capture rejected: intent missing or user mismatch", { orderID, userId });
      return NextResponse.json({ error: "Order not recognized" }, { status: 403 });
    }

    const token = await getPayPalToken();

    const res = await fetchWithTimeout(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          Authorization:     `Bearer ${token}`,
          // Idempotency key: PayPal accepts arbitrary strings; deterministic per orderID
          "PayPal-Request-Id": `cap-${orderID}`,
        },
      },
      20000,
    );

    const data = await res.json() as {
      status?:  string;
      message?: string;
      details?: Array<{ issue?: string; description?: string }>;
      purchase_units?: Array<{
        payments?: { captures?: Array<{ amount?: { value?: string }; status?: string }> };
      }>;
    };

    if (data.status !== "COMPLETED") {
      const issue = data.details?.[0]?.issue;
      const friendly = (issue && PAYPAL_ERROR_MSGS[issue]) ?? data.message ?? "Payment not completed";
      console.error("PayPal capture not completed:", orderID, JSON.stringify(data));
      return NextResponse.json(
        { error: friendly, status: data.status ?? "UNKNOWN", code: issue },
        { status: 400 }
      );
    }

    /* Validate captured amount matches the original intent */
    const captured = parseFloat(
      data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? "0"
    );
    const capturedCents = Math.round(captured * 100);

    if (capturedCents <= 0) {
      console.error("PayPal capture: zero amount", orderID, JSON.stringify(data));
      return NextResponse.json({ error: "Captured amount invalid" }, { status: 400 });
    }
    if (Math.abs(capturedCents - intent.expected_cents) > 2) {
      console.error("CRITICAL: capture/intent amount mismatch", {
        orderID, expected_cents: intent.expected_cents, captured_cents: capturedCents,
      });
      return NextResponse.json(
        { error: "Captured amount does not match order — contact support", orderID },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: "COMPLETED", orderID, capturedAmount: captured });
  } catch (err) {
    const isAbort = (err as Error)?.name === "AbortError";
    console.error("PayPal capture-order exception:", err);
    return NextResponse.json(
      {
        error: isAbort
          ? "Capture timed out — your payment may still be processing. Check your PayPal account before retrying."
          : "Failed to capture PayPal order",
      },
      { status: isAbort ? 504 : 500 }
    );
  }
}
