import { NextRequest, NextResponse } from "next/server";
import {
  adminDb, getPayPalToken, PAYPAL_BASE, fetchWithTimeout, recordPendingAlert,
} from "@/lib/admin-db";

/**
 * PayPal webhook handler.
 *
 * Subscribed events (configure in PayPal dashboard):
 *   - PAYMENT.CAPTURE.REFUNDED
 *   - PAYMENT.CAPTURE.REVERSED
 *   - CUSTOMER.DISPUTE.CREATED
 *
 * Required env: PAYPAL_WEBHOOK_ID
 *
 * To register: PayPal Dashboard → Developer Apps → your app → Webhooks →
 *   Add webhook URL https://<your-domain>/api/paypal/webhook
 *   subscribed to the events above. Copy the webhook ID into PAYPAL_WEBHOOK_ID.
 */
export async function POST(req: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not set — webhook disabled");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const transmissionId   = req.headers.get("paypal-transmission-id");
  const transmissionTime = req.headers.get("paypal-transmission-time");
  const certUrl          = req.headers.get("paypal-cert-url");
  const authAlgo         = req.headers.get("paypal-auth-algo");
  const transmissionSig  = req.headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return NextResponse.json({ error: "Missing PayPal headers" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: {
    event_type?: string;
    resource?:   {
      id?:                  string;
      status?:              string;
      supplementary_data?:  { related_ids?: { order_id?: string } };
      disputed_transactions?: Array<{ seller_transaction_id?: string }>;
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  /* Verify the signature with PayPal */
  try {
    const token = await getPayPalToken();
    const verifyRes = await fetchWithTimeout(
      `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          auth_algo:         authAlgo,
          cert_url:          certUrl,
          transmission_id:   transmissionId,
          transmission_sig:  transmissionSig,
          transmission_time: transmissionTime,
          webhook_id:        webhookId,
          webhook_event:     event,
        }),
      },
      10000,
    );
    const verify = await verifyRes.json() as { verification_status?: string };
    if (verify.verification_status !== "SUCCESS") {
      console.error("PayPal webhook signature INVALID", verify, event.event_type);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch (e) {
    console.error("PayPal webhook verify failed:", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }

  const eventType = event.event_type;
  const resource  = event.resource;
  const ppOrderId = resource?.supplementary_data?.related_ids?.order_id ?? resource?.id;
  const db        = adminDb();

  try {
    if (eventType === "PAYMENT.CAPTURE.REFUNDED" || eventType === "PAYMENT.CAPTURE.REVERSED") {
      if (ppOrderId) {
        const { data } = await db
          .from("orders")
          .update({ status: "refunded" } as never)
          .eq("paypal_order_id", ppOrderId as never)
          .select("id, user_id");

        const updated = (data as Array<{ id: string; user_id: string }> | null) ?? [];
        for (const order of updated) {
          await recordPendingAlert({
            order_id: order.id,
            user_id:  order.user_id,
            reason:   `PayPal ${eventType}`,
            details:  event,
          }).catch((e) => console.error("pending_alerts insert failed:", e));
        }
      }
    } else if (eventType === "CUSTOMER.DISPUTE.CREATED") {
      const sellerTxn = resource?.disputed_transactions?.[0]?.seller_transaction_id;
      let userId:  string | null = null;
      let orderId: string | null = null;
      if (sellerTxn) {
        const { data: matched } = await db
          .from("orders")
          .select("id, user_id")
          .eq("paypal_order_id", sellerTxn as never)
          .maybeSingle();
        const m = matched as { id: string; user_id: string } | null;
        if (m) { userId = m.user_id; orderId = m.id; }
      }
      await recordPendingAlert({
        order_id: orderId,
        user_id:  userId,
        reason:   "PayPal dispute opened",
        details:  event,
      });
    } else {
      // Other event types — ack so PayPal doesn't retry
      console.info("PayPal webhook (unhandled):", eventType);
    }
  } catch (e) {
    console.error("PayPal webhook handler error:", e);
    // Still 200 so PayPal doesn't endlessly retry; we logged for ops.
  }

  return NextResponse.json({ ok: true });
}
