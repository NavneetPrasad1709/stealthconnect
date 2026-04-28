import { Resend } from "resend";
import { render } from "@react-email/components";
import OrderConfirmation  from "@/emails/OrderConfirmation";
import TeamNotification   from "@/emails/TeamNotification";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM         = process.env.EMAIL_FROM     ?? "StealthConnect AI <onboarding@resend.dev>";
const TEAM         = process.env.TEAM_EMAIL     ?? "support@stealthconnect.ai";
const APP          = process.env.NEXT_PUBLIC_APP_URL ?? "https://stealthconnect.ai";
const SUPPORT      = process.env.SUPPORT_EMAIL  ?? "support@stealthconnect.ai";

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
    from:    FROM,
    to:      data.userEmail,
    subject: `✅ Order #${shortId} Received — Results in 30 Minutes`,
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
    from:    FROM,
    to:      TEAM,
    subject: `🔔 New Order #${shortId} — Action Required`,
    html,
  });
}
