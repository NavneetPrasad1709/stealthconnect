"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";

const F = "var(--font-montserrat,'Montserrat',sans-serif)";

const inputStyle: React.CSSProperties = {
  fontFamily: F,
  fontSize: 14,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  color: "#fff",
  width: "100%",
  padding: "12px 16px",
  outline: "none",
  transition: "border-color 0.15s ease",
};

const labelStyle: React.CSSProperties = {
  fontFamily: F,
  fontSize: 11,
  fontWeight: 700,
  color: "rgba(255,255,255,0.35)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  display: "block",
  marginBottom: 6,
};

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "rgba(0,56,255,0.55)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-10 px-6 rounded-2xl text-center"
        style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}
      >
        <CheckCircle className="w-10 h-10 text-green-400" />
        <p style={{ fontFamily: F, fontWeight: 700, fontSize: 16, color: "#fff", margin: 0 }}>
          Message sent!
        </p>
        <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
          We&apos;ll get back to you within 24 hours on business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label style={labelStyle} htmlFor="cf-name">Name</label>
        <input
          id="cf-name"
          type="text"
          placeholder="Your name"
          required
          minLength={2}
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          style={inputStyle}
          className="placeholder:text-white/20"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          style={inputStyle}
          className="placeholder:text-white/20"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          placeholder="How can we help?"
          required
          minLength={10}
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onFocus={onFocus as any}
          onBlur={onBlur as any}
          style={{ ...inputStyle, resize: "vertical", minHeight: 110 }}
          className="placeholder:text-white/20"
        />
      </div>

      {error && (
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p style={{ fontFamily: F, fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-[15px] transition-all disabled:opacity-50 active:scale-[0.98]"
        style={{
          background: "#0038FF",
          color: "#fff",
          fontFamily: F,
          boxShadow: "0 4px 24px rgba(0,56,255,0.35)",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
