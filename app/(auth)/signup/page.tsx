"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SignUpPage, Testimonial } from "@/components/ui/sign-up";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Found 40 verified contacts in under an hour. Closed two deals that same week.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "Replaced three tools with this one. The accuracy is unmatched.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "Our outbound response rate doubled after switching to StealthConnect AI.",
  },
];

function SuccessScreen({ email }: { email: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative"
      style={{ background: "#000000" }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="w-[480px] h-[480px] rounded-full blur-[120px]" style={{ background: "rgba(37,99,235,0.08)" }} />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card max-w-md w-full text-center space-y-5 relative z-10 p-8"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h2
            className="text-2xl font-bold mb-2 text-white"
            style={{ fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
          >
            Check your email
          </h2>
          <p
            className="text-white/40 text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
          >
            We sent a confirmation link to{" "}
            <span className="text-white font-medium">{email}</span>.
            Click it to activate your account and claim your free credit.
          </p>
        </div>
        <Link
          href="/login"
          className="btn-ghost inline-block text-sm"
          style={{ fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
        >
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fullName = (form.get("fullName") as string).trim();
    const email = form.get("email") as string;
    const phone = (form.get("phone") as string).trim();
    const linkedinUrl = (form.get("linkedinUrl") as string).trim();
    const password = form.get("password") as string;

    if (fullName.length < 2) { setError("Full name must be at least 2 characters."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            linkedin_id: linkedinUrl || null,
          },
          emailRedirectTo: `${APP_URL}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessEmail(email);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setOauthLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${APP_URL}/auth/callback` },
      });
      if (error) {
        setError(error.message);
        setOauthLoading(false);
      }
    } catch {
      setError("Google sign-up failed. Please try again.");
      setOauthLoading(false);
    }
  }

  if (successEmail) return <SuccessScreen email={successEmail} />;

  return (
    <SignUpPage
      heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={testimonials}
      onSignUp={handleSignUp}
      onGoogleSignUp={handleGoogleSignUp}
      onSignIn={() => router.push("/login")}
      loading={loading}
      oauthLoading={oauthLoading}
      error={error}
    />
  );
}
