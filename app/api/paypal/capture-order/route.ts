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
    const { orderID } = await req.json() as { orderID: string };

    const token = await getAccessToken();

    const res = await fetch(`${BASE}/v2/checkout/orders/${orderID}/capture`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    return NextResponse.json({ status: "COMPLETED", orderID });
  } catch {
    return NextResponse.json({ error: "Failed to capture PayPal order" }, { status: 500 });
  }
}
