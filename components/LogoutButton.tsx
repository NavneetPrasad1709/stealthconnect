"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

interface Props {
  /** Icon-only mode for sidebar */
  compact?: boolean;
}

export default function LogoutButton({ compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        aria-label="Sign out"
        title="Sign out"
        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-50 shrink-0 hover:opacity-70"
        style={{
          border:     "1px solid var(--border-strong)",
          background: "var(--elevated)",
          color:      "var(--fg-muted)",
        }}
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        border:     "1.5px solid var(--border-strong)",
        color:      "var(--fg-muted)",
        background: "var(--elevated)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--fg)";
        e.currentTarget.style.borderColor = "var(--brand)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--fg-muted)";
        e.currentTarget.style.borderColor = "var(--border-strong)";
      }}
    >
      <LogOut className="w-3.5 h-3.5" />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
