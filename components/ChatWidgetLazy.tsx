"use client";

import dynamic from "next/dynamic";

const FloatingActions = dynamic(
  () => import("@/components/FloatingActions").then(m => m.FloatingActions),
  { ssr: false }
);

export function ChatWidgetLazy() {
  return <FloatingActions />;
}
