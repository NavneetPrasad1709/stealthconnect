import { NextRequest, NextResponse } from "next/server";

const BASE =
  process.env.PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function getAccessToken() {
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json() as { amount: number };

    const token = await getAccessToken();

    const res = await fetch(`${BASE}/v2/checkout/orders`, {
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
