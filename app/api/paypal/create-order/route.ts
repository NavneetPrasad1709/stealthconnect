import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getPayPalToken, PAYPAL_BASE, fetchWithTimeout, recordPayPalIntent,
} from "@/lib/admin-db";
import { rateLimit } from "@/lib/rate-limit";

interface CreateOrderPayload {
  contact_type:           "email" | "phone" | "both";
  quantity:               number;
  email_draft_requested?: boolean;
}

const BASE_CENTS: Record<string, number> = { email: 20, phone: 100, both: 120 };
const MAX_QUANTITY = 1000;

export async function POST(req: NextRequest) {
  try {
    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!rateLimit(`paypal-create:${userId}`, 5, 0.5)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json() as CreateOrderPayload;
    const { contact_type, quantity, email_draft_requested = false } = body;

    if (!["email", "phone", "both"].includes(contact_type)) {
      return NextResponse.json({ error: "Invalid contact type" }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_QUANTITY) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    /* Server-authoritative price calculation (integer cents) */
    const expectedCents =
      quantity * BASE_CENTS[contact_type] +
      (email_draft_requested ? quantity * 100 : 0);
    const amount = (expectedCents / 100).toFixed(2);

    const token = await getPayPalToken();

    const res = await fetchWithTimeout(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: amount },
            description: "StealthConnect AI — Contact Lookup",
          },
        ],
        application_context: {
          brand_name:          "StealthConnect AI",
          shipping_preference: "NO_SHIPPING",
          user_action:         "PAY_NOW",
        },
      }),
    }, 15000);

    const order = await res.json();

    if (!order.id) {
      console.error("PayPal create-order error:", JSON.stringify(order));
      return NextResponse.json(
        { error: order.message ?? "Failed to create PayPal order" },
        { status: res.status }
      );
    }

    /* Persist intent for ownership + amount verification at capture/order time */
    try {
      await recordPayPalIntent({
        paypal_order_id: order.id,
        user_id:         userId,
        contact_type,
        quantity,
        email_draft:     email_draft_requested,
        expected_cents:  expectedCents,
      });
    } catch (e) {
      console.error("CRITICAL: failed to record paypal_intent for order", order.id, e);
      // Reject the PayPal order so the user can retry cleanly rather than
      // ending up with an unverifiable charge.
      return NextResponse.json(
        { error: "Could not start payment session — please retry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("PayPal create-order exception:", err);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
