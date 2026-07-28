import { Resend } from "resend";
import { render } from "@react-email/components";
import OrderConfirmation  from "@/emails/OrderConfirmation";
import TeamNotification   from "@/emails/TeamNotification";

const resend = new Resend(process.env.RESEND_API_KEY);

// FP-05: no unverified-sender fallback. EMAIL_FROM must be a verified Resend domain
// sender in production; the previous "onboarding@resend.dev" default failed SPF/DKIM
// and landed in spam. assertFrom() throws if unset — callers catch it and record a
// pending_alert rather than silently sending from a bad address.
const FROM         = process.env.EMAIL_FROM;
const TEAM         = process.env.TEAM_EMAIL     ?? "support@stealthconnect.ai";
const APP          = process.env.NEXT_PUBLIC_APP_URL ?? "https://stealthconnect.ai";
const SUPPORT      = process.env.SUPPORT_EMAIL  ?? "support@stealthconnect.ai";

function assertFrom(): string {
  if (!FROM) {
    throw new Error(
      'EMAIL_FROM is not configured, set a verified Resend domain sender, e.g. "StealthConnect AI <orders@stealthconnect.ai>".'
    );
  }
  return FROM;
}

/* ── Shared payload type ────────────────────────────────────── */
export interface OrderEmailData {
  orderId:      string;
  userEmail:    string;
  userName:     string;
  contactType:  "email" | "phone" | "both";
  quantity:     number;
  amountPaid:   number;
  usedCredits:  boolean;
  linkedinUrls: string[];
  emailDraft:   boolean;
}

/* ── 1. User order confirmation ─────────────────────────────── */
export async function sendOrderConfirmation(data: OrderEmailData) {
  const shortId = data.orderId.slice(0, 8).toUpperCase();

  const html = await render(
    OrderConfirmation({
      orderId:      data.orderId,
      userName:     data.userName,
      contactType:  data.contactType,
      quantity:     data.quantity,
      amountPaid:   data.amountPaid,
      usedCredits:  data.usedCredits,
      emailDraft:   data.emailDraft,
      appUrl:       APP,
      supportEmail: SUPPORT,
    })
  );

  return resend.emails.send({
    from:    assertFrom(),
    to:      data.userEmail,
    subject: `✅ Order #${shortId} Received - Results in 30 Minutes`,
    html,
  });
}

/* ── 2. Internal team notification ──────────────────────────── */
export async function sendTeamNotification(data: OrderEmailData) {
  const shortId = data.orderId.slice(0, 8).toUpperCase();

  const html = await render(
    TeamNotification({
      orderId:      data.orderId,
      userName:     data.userName,
      userEmail:    data.userEmail,
      contactType:  data.contactType,
      quantity:     data.quantity,
      amountPaid:   data.amountPaid,
      usedCredits:  data.usedCredits,
      emailDraft:   data.emailDraft,
      linkedinUrls: data.linkedinUrls,
      appUrl:       APP,
      createdAt:    new Date().toISOString(),
    })
  );

  return resend.emails.send({
    from:    assertFrom(),
    to:      TEAM,
    subject: `🔔 New Order #${shortId} - Action Required`,
    html,
  });
}

/* ── 3. Refund notification (customer) — FP-12 ──────────────── */
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

export async function sendRefundNotification(data: {
  to: string; name: string; orderId: string; amount: number;
}) {
  const shortId    = data.orderId.slice(0, 8).toUpperCase();
  const amountLine = data.amount > 0 ? ` of $${data.amount.toFixed(2)}` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#0b0b0b;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:24px auto;background:#141414;border:1px solid #222;border-radius:12px;padding:28px;color:#eaeaea">
    <h1 style="font-size:18px;margin:0 0 14px;color:#ffffff">Your refund has been processed</h1>
    <p style="font-size:14px;line-height:1.65;color:#bdbdbd;margin:0 0 10px">Hi ${esc(data.name)},</p>
    <p style="font-size:14px;line-height:1.65;color:#bdbdbd;margin:0 0 10px">We've refunded your payment${amountLine} for order <strong style="color:#fff">#${esc(shortId)}</strong>. The funds will return to your original payment method within a few business days, depending on your bank or PayPal.</p>
    <p style="font-size:14px;line-height:1.65;color:#bdbdbd;margin:0 0 10px">Questions? Reply to this email or reach us at <a href="mailto:${esc(SUPPORT)}" style="color:#3b82f6">${esc(SUPPORT)}</a>.</p>
    <p style="font-size:12px;color:#777;margin:22px 0 0">- StealthConnect AI</p>
  </div></body></html>`;

  return resend.emails.send({
    from:    assertFrom(),
    to:      data.to,
    subject: `Refund processed - Order #${shortId}`,
    html,
  });
}
