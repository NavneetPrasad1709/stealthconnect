import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getPayPalToken, PAYPAL_BASE } from "@/lib/admin-db";

export async function POST(req: NextRequest) {
  try {
    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await req.json() as { amount: number };

    if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const token = await getPayPalToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value:         amount.toFixed(2),
            },
            description: "StealthConnect AI — Contact Lookup",
          },
        ],
        application_context: {
          brand_name:          "StealthConnect AI",
          shipping_preference: "NO_SHIPPING",
          user_action:         "PAY_NOW",
        },
      }),
    });

    const order = await res.json();

    if (!order.id) {
      console.error("PayPal create-order error:", JSON.stringify(order));
      return NextResponse.json(
        { error: order.message ?? "Failed to create PayPal order" },
        { status: res.status }
      );
    }

    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("PayPal create-order exception:", err);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
