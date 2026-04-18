import {
  Body, Container, Column, Head, Heading, Hr, Html,
  Link, Preview, Row, Section, Text, Font,
} from "@react-email/components";

/* ── Types ─────────────────────────────────────────────────── */
export interface TeamNotificationProps {
  orderId:      string;
  userName:     string;
  userEmail:    string;
  contactType:  "email" | "phone" | "both";
  quantity:     number;
  amountPaid:   number;
  usedCredits:  boolean;
  emailDraft:   boolean;
  linkedinUrls: string[];
  appUrl:       string;
  createdAt:    string;
}

/* ── Constants ──────────────────────────────────────────────── */
const CONTACT_LABEL: Record<string, string> = {
  email: "Email Addresses",
  phone: "Mobile Numbers",
  both:  "Email + Phone",
};

const C = {
  bg:      "#f4f6f9",
  card:    "#ffffff",
  dark:    "#0a0f1e",
  brand:   "#2563eb",
  surface: "#f8fafd",
  amber:   "#92400e",
  amberBg: "#fffbeb",
  amberBd: "#fde68a",
  green:   "#065f46",
  greenBg: "#ecfdf5",
  greenBd: "#a7f3d0",
  red:     "#991b1b",
  redBg:   "#fef2f2",
  redBd:   "#fecaca",
  muted:   "#64748b",
  subtle:  "#94a3b8",
  border:  "#e2e8f0",
};

/* ── Row helper ─────────────────────────────────────────────── */
function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <Row style={{ borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <Column style={{ width: 140, padding: "11px 18px", verticalAlign: "top" }}>
        <Text style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.dark }}>
          {label}
        </Text>
      </Column>
      <Column style={{ padding: "11px 18px", verticalAlign: "top" }}>
        <Text style={{ margin: 0, fontSize: 12.5, color: C.muted }}>
          {value}
        </Text>
      </Column>
    </Row>
  );
}

/* ── Component ──────────────────────────────────────────────── */
export default function TeamNotification({
  orderId,
  userName,
  userEmail,
  contactType,
  quantity,
  amountPaid,
  usedCredits,
  emailDraft,
  linkedinUrls,
  appUrl,
  createdAt,
}: TeamNotificationProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const time    = new Date(createdAt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>
        {`🔔 New order #${shortId} from ${userName} — ${String(quantity)} ${CONTACT_LABEL[contactType]}. Deliver within 30 minutes.`}
      </Preview>

      <Body style={{ backgroundColor: C.bg, margin: 0, padding: 0, fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "40px 16px" }}>

          <Section style={{ backgroundColor: C.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}` }}>

            {/* Header */}
            <Section style={{ backgroundColor: C.dark, padding: "24px 32px" }}>
              <Row>
                <Column>
                  <Text style={{ margin: 0, color: "#ffffff", fontSize: 15.5, fontWeight: 700, letterSpacing: "-0.3px" }}>
                    ⚡ StealthConnect AI
                  </Text>
                </Column>
                <Column align="right">
                  <div style={{
                    display: "inline-block",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                    letterSpacing: "0.05em",
                  }}>
                    INTERNAL
                  </div>
                </Column>
              </Row>
            </Section>

            {/* Action required banner */}
            <Section style={{
              backgroundColor: C.amberBg,
              borderBottom: `1px solid ${C.amberBd}`,
              padding: "14px 32px",
            }}>
              <Text style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.amber }}>
                🔔 &nbsp;Action required — deliver within 30 minutes
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ padding: "28px 32px 0" }}>

              <Heading style={{
                margin: "0 0 4px",
                fontSize: 21, fontWeight: 700,
                color: C.dark, letterSpacing: "-0.4px",
              }}>
                New Order #{shortId}
              </Heading>
              <Text style={{ margin: "0 0 24px", fontSize: 13, color: C.muted }}>
                Received {time}
              </Text>

              {/* Order details */}
              <Text style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Order Details
              </Text>
              <Section style={{
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                marginBottom: 20,
              }}>
                <DetailRow label="Customer"      value={`${userName} <${userEmail}>`} />
                <DetailRow label="Contact Type"  value={CONTACT_LABEL[contactType]} />
                <DetailRow label="Profiles"      value={String(quantity)} />
                <DetailRow label="Email Draft"   value={emailDraft ? "Yes — include drafts" : "No"} />
                <DetailRow
                  label="Amount"
                  value={usedCredits ? "Free Credit (no charge)" : `$${amountPaid.toFixed(2)} via PayPal`}
                  last
                />
              </Section>

              {/* LinkedIn URLs */}
              <Text style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                LinkedIn URLs ({linkedinUrls.length})
              </Text>
              <Section style={{
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                marginBottom: 24,
              }}>
                {linkedinUrls.map((url, i) => (
                  <Row
                    key={url}
                    style={{ borderBottom: i < linkedinUrls.length - 1 ? `1px solid ${C.border}` : "none" }}
                  >
                    <Column style={{ width: 36, padding: "10px 0 10px 16px", verticalAlign: "middle" }}>
                      <Text style={{
                        margin: 0, fontSize: 11, fontWeight: 700,
                        color: C.subtle, textAlign: "center",
                      }}>
                        {i + 1}
                      </Text>
                    </Column>
                    <Column style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                      <Link
                        href={url}
                        style={{ fontSize: 12.5, color: C.brand, textDecoration: "none", fontFamily: "monospace" }}
                      >
                        {url}
                      </Link>
                    </Column>
                  </Row>
                ))}
              </Section>

              {/* Delivery reminder */}
              <Section style={{
                backgroundColor: "#fef2f2",
                border: `1px solid #fecaca`,
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 24,
              }}>
                <Text style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#991b1b", lineHeight: "1.5" }}>
                  ⏰ &nbsp;SLA: Deliver results within <strong>30 minutes</strong> of this email.
                  Reply directly to the customer at{" "}
                  <Link href={`mailto:${userEmail}`} style={{ color: "#991b1b" }}>
                    {userEmail}
                  </Link>
                  {" "}if you need to.
                </Text>
              </Section>

              {/* Actions */}
              <Row style={{ marginBottom: 32 }}>
                <Column style={{ paddingRight: 8 }}>
                  <Link
                    href={`${appUrl}/dashboard`}
                    style={{
                      display: "inline-block",
                      backgroundColor: C.brand,
                      color: "#ffffff",
                      borderRadius: 10,
                      padding: "11px 22px",
                      fontSize: 13.5, fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Open dashboard
                  </Link>
                </Column>
                <Column>
                  <Link
                    href={`mailto:${userEmail}?subject=Re: Your StealthConnect order %23${shortId}`}
                    style={{
                      display: "inline-block",
                      backgroundColor: C.surface,
                      color: C.dark,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "11px 22px",
                      fontSize: 13.5, fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Reply to customer
                  </Link>
                </Column>
              </Row>

            </Section>

            {/* Footer */}
            <Hr style={{ margin: 0, borderColor: C.border }} />
            <Section style={{ padding: "18px 32px 24px" }}>
              <Text style={{ margin: 0, fontSize: 11.5, color: C.subtle }}>
                StealthConnect AI · Internal notification · Order #{shortId}
              </Text>
            </Section>

          </Section>

        </Container>
      </Body>
    </Html>
  );
}
