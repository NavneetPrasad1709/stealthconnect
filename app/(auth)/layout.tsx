import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Sign In — StealthConnect AI",
    template: "%s — StealthConnect AI",
  },
  description:
    "Sign in or create your StealthConnect AI account to find verified emails and phone numbers behind any LinkedIn profile.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
