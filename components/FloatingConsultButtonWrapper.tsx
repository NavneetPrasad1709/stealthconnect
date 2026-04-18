"use client";

import { useRouter } from "next/navigation";
import { FloatingConsultButton } from "@/components/floating-consult-button";

export function FloatingConsultButtonWrapper() {
  const router = useRouter();

  return (
    <FloatingConsultButton
      buttonSize={72}
      imageSize={42}
      imageSrc="/consult-icon.svg"
      imageAlt="StealthConnect AI"
      revolvingText="StealthConnect AI • LinkedIn Contacts • Verified Data • "
      popupHeading="Get 1 Free Lookup"
      popupBadgeText="Free"
      popupDescription="Paste any LinkedIn profile URL and get a verified email or phone number in 30 minutes. No subscription — pay only per result. First lookup is on us."
      ctaButtonText="Claim Free Lookup"
      ctaButtonAction={() => router.push("/signup")}
      position={{ bottom: "116px", right: "1.5rem" }}
    />
  );
}
