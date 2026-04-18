import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Clickjacking protection
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  // Referrer policy
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // DNS prefetch
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  // HSTS — forces HTTPS (ignored on HTTP/localhost, active in production)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Prevent cross-origin pop-up hijacking
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // Prevent external sites reading our resources
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  // Limit browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // Content Security Policy
  // Using strict-dynamic + nonce is ideal but complex with PayPal/Google Fonts.
  // This policy restricts the most dangerous vectors while staying compatible.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: allow self, PayPal, Google (OAuth) — unsafe-inline needed for Next.js hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com https://accounts.google.com",
      // Styles: allow self + inline (Tailwind/Framer Motion use inline styles)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: allow self, data URIs, unsplash, randomuser, PayPal, Supabase
      "img-src 'self' data: blob: https://images.unsplash.com https://randomuser.me https://www.paypal.com https://www.sandbox.paypal.com https://lprkydvbdhhtymagdskd.supabase.co https://media.licdn.com https://avatars.githubusercontent.com",
      // Fetch/XHR: allow self, Supabase, Anthropic, PayPal, Resend
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://api.resend.com https://accounts.google.com",
      // Frames: PayPal popup
      "frame-src https://www.paypal.com https://www.sandbox.paypal.com https://accounts.google.com",
      // Restrict <object> and <embed>
      "object-src 'none'",
      // Restrict <base> tag
      "base-uri 'self'",
      // Restrict form targets
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
