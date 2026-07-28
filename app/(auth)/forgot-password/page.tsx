import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: { absolute: "Reset Password — StealthConnect AI" },
  description:
    "Reset your StealthConnect AI account password. Enter your email and we'll send you a secure reset link.",
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
