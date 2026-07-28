import type { Metadata } from "next";
import { Suspense } from "react";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: { absolute: "Create Your Free Account | StealthConnect AI" },
  description:
    "Create your free StealthConnect AI account and get 1 free verified LinkedIn contact lookup. No credit card, no subscription, pay-per-result.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#000000" }} />}>
      <SignupClient />
    </Suspense>
  );
}
