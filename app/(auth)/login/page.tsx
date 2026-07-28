import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: { absolute: "Sign In | StealthConnect AI" },
  description:
    "Sign in to your StealthConnect AI account to look up verified LinkedIn contacts and manage your credits.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#000000" }} />}>
      <LoginClient />
    </Suspense>
  );
}
