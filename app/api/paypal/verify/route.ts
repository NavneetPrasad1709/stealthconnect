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

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}`, {
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "PayPal order not found" }, { status: 404 });
    }

    const data = await res.json() as {
      id:     string;
      status: string;
      purchase_units: Array<{
        amount: { value: string; currency_code: string };
      }>;
    };

    const unit   = data.purchase_units?.[0];
    const amount = parseFloat(unit?.amount?.value ?? "0");

    return NextResponse.json({
      orderID:  data.id,
      status:   data.status,          // e.g. CREATED, APPROVED, COMPLETED
      amount,
      currency: unit?.amount?.currency_code ?? "USD",
      verified: data.status === "COMPLETED",
    });
  } catch (err) {
    console.error("PayPal verify error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
