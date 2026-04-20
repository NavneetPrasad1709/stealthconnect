"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const FloatingActions = dynamic(
  () => import("@/components/FloatingActions").then(m => m.FloatingActions),
  { ssr: false }
);

const HIDDEN_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth"];

export function ChatWidgetLazy() {
  const pathname = usePathname();
  if (pathname && HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))) return null;
  return <FloatingActions />;
}
