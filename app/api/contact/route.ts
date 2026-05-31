import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** Allow same-site submissions only (apex or www of NEXT_PUBLIC_APP_URL), plus localhost in dev. */
function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser client / same-origin without an Origin header
  try {
    const host = new URL(origin).host.replace(/^www\./, "");
    const allowed = new Set<string>(["localhost:3000", "localhost"]);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) allowed.add(new URL(appUrl).host.replace(/^www\./, ""));
    return allowed.has(host);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // FP-04: block cross-site submissions + per-IP rate limit (anti-spam / Resend cost).
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!rateLimit(`contact:${clientIp(req)}`, 5, 0.02)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, message, company } = body as {
      name?: string; email?: string; message?: string; company?: string;
    };

    // Honeypot: real users never fill `company`. Pretend success so bots don't learn.
    if (company && company.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (message.trim().length < 10) {
      return NextResponse.json({ error: "Message too short." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Contact form is not configured. Please email support@stealthconnect.ai directly." },
        { status: 503 }
      );
    }

    const from = process.env.EMAIL_FROM ?? "StealthConnect AI <onboarding@resend.dev>";
    const to = process.env.TEAM_EMAIL ?? "support@stealthconnect.ai";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email.trim(),
        subject: `Contact form: ${name.trim()}`,
        text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[contact] resend failed", res.status, detail);
      return NextResponse.json({ error: "Failed to send. Please email us directly." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}
