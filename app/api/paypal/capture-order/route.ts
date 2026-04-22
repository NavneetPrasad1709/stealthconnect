import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getPayPalToken, PAYPAL_BASE } from "@/lib/admin-db";

export async function POST(req: NextRequest) {
  try {
    const h      = await headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderID } = await req.json() as { orderID: string };
    if (!orderID) return NextResponse.json({ error: "orderID required" }, { status: 400 });

    const token = await getPayPalToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.status !== "COMPLETED") {
      console.error("PayPal capture not completed:", orderID, JSON.stringify(data));
      return NextResponse.json(
        { error: data.message ?? "Payment not completed", status: data.status },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: "COMPLETED", orderID });
  } catch (err) {
    console.error("PayPal capture-order exception:", err);
    return NextResponse.json({ error: "Failed to capture PayPal order" }, { status: 500 });
  }
}
