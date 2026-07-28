import { NextRequest, NextResponse } from "next/server";
import {
  adminDb, getProfile, getPayPalToken, PAYPAL_BASE, fetchWithTimeout, recordPendingAlert,
} from "@/lib/admin-db";
import { sendRefundNotification } from "@/lib/email";

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
    console.error("PAYPAL_WEBHOOK_ID not set, webhook disabled");
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

  // FP-12: unhandled event types are NOT errors — ack with 200 so PayPal stops delivering.
  const HANDLED = new Set([
    "PAYMENT.CAPTURE.REFUNDED",
    "PAYMENT.CAPTURE.REVERSED",
    "CUSTOMER.DISPUTE.CREATED",
  ]);
  if (!eventType || !HANDLED.has(eventType)) {
    console.info("PayPal webhook (unhandled, acked):", eventType);
    return NextResponse.json({ ok: true });
  }

  try {
    if (eventType === "PAYMENT.CAPTURE.REFUNDED" || eventType === "PAYMENT.CAPTURE.REVERSED") {
      if (!ppOrderId) {
        // Can't correlate to an order — retrying won't help; alert + ack.
        await recordPendingAlert({
          reason:  `PayPal ${eventType} without a correlatable order id`,
          details: event,
        }).catch((e) => console.error("pending_alerts insert failed:", e));
        return NextResponse.json({ ok: true });
      }

      // Idempotent: only flip orders that are NOT already refunded. The returned set
      // tells us which rows WE changed, so a retried delivery won't double-process.
      const { data: changed, error: upErr } = await db
        .from("orders")
        .update({ status: "refunded" } as never)
        .eq("paypal_order_id", ppOrderId as never)
        .neq("status", "refunded" as never)
        .select("id, user_id, amount_paid");

      if (upErr) throw upErr; // transient DB error → 500 below → PayPal retries safely

      const rows = (changed as Array<{ id: string; user_id: string; amount_paid: number }> | null) ?? [];
      if (rows.length === 0) {
        // Already refunded (idempotent replay) or no matching order — nothing to do.
        console.info("PayPal refund: no rows changed (already refunded / unknown order):", ppOrderId);
        return NextResponse.json({ ok: true });
      }

      for (const order of rows) {
        await recordPendingAlert({
          order_id: order.id,
          user_id:  order.user_id,
          reason:   `PayPal ${eventType}`,
          details:  event,
        }).catch((e) => console.error("pending_alerts insert failed:", e));

        // NOTE: no credit reversal — PayPal settles CASH orders (paypal_order_id set,
        // amount_paid > 0) which never consumed credits; credit-funded orders have no
        // PayPal webhook. We notify the customer that the refund landed instead.
        try {
          const profile = await getProfile(order.user_id);
          if (profile?.email) {
            await sendRefundNotification({
              to:      profile.email,
              name:    profile.full_name ?? profile.email,
              orderId: order.id,
              amount:  order.amount_paid,
            });
          }
        } catch (e) {
          console.error("Refund notification email failed:", e);
          await recordPendingAlert({
            order_id: order.id,
            user_id:  order.user_id,
            reason:   "Refund notification email failed",
            details:  { error: String((e as Error)?.message ?? e) },
          }).catch(() => {});
          // Don't fail the webhook for a notification problem — the refund itself is
          // already recorded and is idempotent on retry.
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
    }
  } catch (e) {
    console.error("PayPal webhook handler error:", e);
    // FP-12: return non-2xx so PayPal RETRIES the delivery. The idempotency guards above
    // (conditional status update) make retries safe — no double refunds/notifications.
    return NextResponse.json({ error: "handler error, will retry" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
