import {
  Body, Container, Column, Head, Heading, Hr, Html,
  Link, Preview, Row, Section, Text, Font,
} from "@react-email/components";

/* ── Types ─────────────────────────────────────────────────── */
export interface OrderConfirmationProps {
  orderId:     string;
  userName:    string;
  contactType: "email" | "phone" | "both";
  quantity:    number;
  amountPaid:  number;
  usedCredits: boolean;
  emailDraft:  boolean;
  appUrl:      string;
  supportEmail: string;
}

/* ── Constants ──────────────────────────────────────────────── */
const CONTACT_LABEL: Record<string, string> = {
  email: "Email Addresses",
  phone: "Mobile Numbers",
  both:  "Email + Phone",
};

const C = {
  bg:       "#f4f6f9",
  card:     "#ffffff",
  dark:     "#0a0f1e",
  brand:    "#2563eb",
  brandBg:  "#eff6ff",
  brandBdr: "#bfdbfe",
  green:    "#059669",
  greenBg:  "#ecfdf5",
  greenBdr: "#a7f3d0",
  muted:    "#64748b",
  subtle:   "#94a3b8",
  border:   "#e2e8f0",
  surface:  "#f8fafd",
};

/* ── Component ──────────────────────────────────────────────── */
export default function OrderConfirmation({
  orderId,
  userName,
  contactType,
  quantity,
  amountPaid,
  usedCredits,
  emailDraft,
  appUrl,
  supportEmail,
}: OrderConfirmationProps) {
  const shortId   = orderId.slice(0, 8).toUpperCase();
  const firstName = userName.split(" ")[0];

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
        Order #{shortId} confirmed — your results will be ready in 30 minutes.
      </Preview>

      <Body style={{ backgroundColor: C.bg, margin: 0, padding: 0, fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 16px" }}>

          {/* ── Card ────────────────────────────────────────── */}
          <Section style={{ backgroundColor: C.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}` }}>

            {/* Header */}
            <Section style={{ backgroundColor: C.dark, padding: "28px 36px" }}>
              <Row>
                <Column style={{ width: 36 }}>
                  <div style={{
                    width: 32, height: 32,
                    backgroundColor: C.brand,
                    borderRadius: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, lineHeight: "32px", textAlign: "center",
                  }}>
                    ⚡
                  </div>
                </Column>
                <Column style={{ paddingLeft: 10 }}>
                  <Text style={{
                    color: "#ffffff", margin: 0,
                    fontSize: 16, fontWeight: 700,
                    letterSpacing: "-0.3px",
                  }}>
                    StealthConnect AI
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.45)", margin: 0, fontSize: 11.5 }}>
                    LinkedIn Contact Intelligence
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Status bar */}
            <Section style={{
              backgroundColor: C.greenBg,
              borderBottom: `1px solid ${C.greenBdr}`,
              padding: "14px 36px",
            }}>
              <Text style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.green }}>
                ✓ &nbsp;Order confirmed and queued for processing
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ padding: "32px 36px 0" }}>

              {/* Greeting */}
              <Heading style={{
                margin: "0 0 8px",
                fontSize: 24, fontWeight: 700,
                color: C.dark, letterSpacing: "-0.5px",
                lineHeight: "1.25",
              }}>
                Hey {firstName} 👋
              </Heading>
              <Text style={{
                margin: "0 0 28px",
                fontSize: 14.5, color: C.muted, lineHeight: "1.65",
              }}>
                We've received your order and our team is already on it.
                Expect your results <strong style={{ color: C.dark, fontWeight: 600 }}>within 30 minutes</strong>.
              </Text>

              {/* Order ID pill */}
              <Section style={{
                backgroundColor: C.surface,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                marginBottom: 20,
                padding: "14px 20px",
              }}>
                <Row>
                  <Column>
                    <Text style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Order ID
                    </Text>
                    <Text style={{ margin: "3px 0 0", fontSize: 18, fontWeight: 700, color: C.dark, fontFamily: "monospace" }}>
                      #{shortId}
                    </Text>
                  </Column>
                  <Column align="right">
                    <div style={{
                      display: "inline-block",
                      backgroundColor: C.greenBg,
                      border: `1px solid ${C.greenBdr}`,
                      borderRadius: 999,
                      padding: "4px 12px",
                      fontSize: 11.5, fontWeight: 700, color: C.green,
                    }}>
                      Processing
                    </div>
                  </Column>
                </Row>
              </Section>

              {/* Order summary grid */}
              <Section style={{
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                marginBottom: 24,
              }}>
                {/* Row 1 */}
                <Row>
                  <Column style={{
                    width: "50%", padding: "14px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    borderRight: `1px solid ${C.border}`,
                  }}>
                    <Text style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em" }}>Contact type</Text>
                    <Text style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 600, color: C.dark }}>
                      {CONTACT_LABEL[contactType]}
                    </Text>
                  </Column>
                  <Column style={{
                    width: "50%", padding: "14px 20px",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <Text style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em" }}>Profiles</Text>
                    <Text style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 600, color: C.dark }}>
                      {quantity}
                    </Text>
                  </Column>
                </Row>
                {/* Row 2 */}
                <Row>
                  <Column style={{
                    width: "50%", padding: "14px 20px",
                    borderRight: `1px solid ${C.border}`,
                    backgroundColor: C.surface,
                  }}>
                    <Text style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em" }}>Payment</Text>
                    <Text style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 600, color: C.dark }}>
                      {usedCredits ? "Free Credit" : `$${amountPaid.toFixed(2)}`}
                    </Text>
                  </Column>
                  <Column style={{
                    width: "50%", padding: "14px 20px",
                    backgroundColor: C.surface,
                  }}>
                    <Text style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Email Draft</Text>
                    <Text style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 600, color: C.dark }}>
                      {emailDraft ? "Included ✓" : "Not included"}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* 30-min promise */}
              <Section style={{
                backgroundColor: C.brandBg,
                border: `1px solid ${C.brandBdr}`,
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 28,
              }}>
                <Text style={{ margin: 0, fontSize: 13.5, color: "#1d4ed8", lineHeight: "1.55" }}>
                  <strong style={{ fontWeight: 700 }}>⏱ 30-minute delivery.</strong>
                  {" "}Results will appear in your dashboard the moment they're ready —
                  we'll also send you a notification email.
                </Text>
              </Section>

              {/* CTA */}
              <Section style={{ marginBottom: 32 }}>
                <Link
                  href={`${appUrl}/dashboard/orders`}
                  style={{
                    display: "inline-block",
                    backgroundColor: C.brand,
                    color: "#ffffff",
                    borderRadius: 11,
                    padding: "13px 26px",
                    fontSize: 14, fontWeight: 600,
                    textDecoration: "none",
                    letterSpacing: "-0.1px",
                  }}
                >
                  View my orders →
                </Link>
              </Section>

            </Section>

            {/* Footer */}
            <Hr style={{ margin: 0, borderColor: C.border }} />
            <Section style={{ padding: "20px 36px 28px" }}>
              <Text style={{ margin: 0, fontSize: 12, color: C.subtle, lineHeight: "1.7" }}>
                Questions? Reply to this email or reach us at{" "}
                <Link href={`mailto:${supportEmail}`} style={{ color: C.brand, textDecoration: "none" }}>
                  {supportEmail}
                </Link>
                .<br />
                StealthConnect AI · LinkedIn Contact Intelligence
              </Text>
            </Section>

          </Section>

          {/* Bottom note */}
          <Text style={{ textAlign: "center", fontSize: 11.5, color: C.subtle, marginTop: 20 }}>
            You received this because you placed an order on{" "}
            <Link href={appUrl} style={{ color: C.muted, textDecoration: "none" }}>
              stealthconnect.ai
            </Link>
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
