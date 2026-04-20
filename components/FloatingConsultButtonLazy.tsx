"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const FloatingConsultButtonWrapper = dynamic(
  () => import("@/components/FloatingConsultButtonWrapper").then(m => ({ default: m.FloatingConsultButtonWrapper })),
  { ssr: false }
);

const HIDDEN_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth"];

export function FloatingConsultButtonLazy() {
  const pathname = usePathname();
  if (pathname && HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))) return null;
  return <FloatingConsultButtonWrapper />;
}
