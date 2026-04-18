"use client";

import dynamic from "next/dynamic";

const FloatingConsultButtonWrapper = dynamic(
  () => import("@/components/FloatingConsultButtonWrapper").then(m => ({ default: m.FloatingConsultButtonWrapper })),
  { ssr: false }
);

export function FloatingConsultButtonLazy() {
  return <FloatingConsultButtonWrapper />;
}
