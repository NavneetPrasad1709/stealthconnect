"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const FloatingActions = dynamic(
  () => import("@/components/FloatingActions").then(m => m.FloatingActions),
  { ssr: false }
);

const HIDDEN_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth"];

export function ChatWidgetLazy() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ric: (cb: () => void) => number =
      (typeof window !== "undefined" && (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback) ||
      ((cb: () => void) => window.setTimeout(cb, 3000));
    const id = ric(() => setReady(true));
    return () => {
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cic) cic(id);
      else clearTimeout(id);
    };
  }, []);

  if (pathname && HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))) return null;
  if (!ready) return null;
  return <FloatingActions />;
}
