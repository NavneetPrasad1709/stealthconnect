"use client"

import { useRouter } from "next/navigation"
import { ImageCarouselHero } from "@/components/ai-image-generator-hero"

const CARDS = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Head of Sales",
    company: "Stripe",
    initials: "SC",
    avatarGradient: "linear-gradient(135deg, #3b82f6, #6366f1)",
    email: "s.chen@str••••.com",
    phone: "+1 (415) ••• ••••",
    rotation: -8,
  },
  {
    id: "2",
    name: "Marcus Webb",
    title: "CEO & Co-Founder",
    company: "GrowthLabs",
    initials: "MW",
    avatarGradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    email: "m.webb@grow••••.io",
    phone: "+1 (628) ••• ••••",
    rotation: 5,
  },
  {
    id: "3",
    name: "Priya Nair",
    title: "VP of Marketing",
    company: "HubSpot",
    initials: "PN",
    avatarGradient: "linear-gradient(135deg, #10b981, #3b82f6)",
    email: "p.nair@hubsp••.com",
    phone: "+1 (857) ••• ••••",
    rotation: -3,
  },
  {
    id: "4",
    name: "James Liu",
    title: "Founder",
    company: "Venture.io",
    initials: "JL",
    avatarGradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    email: "james@ventu••••.io",
    phone: "+1 (212) ••• ••••",
    rotation: 10,
  },
  {
    id: "5",
    name: "Emily Ross",
    title: "Director of BD",
    company: "Salesforce",
    initials: "ER",
    avatarGradient: "linear-gradient(135deg, #ec4899, #f97316)",
    email: "e.ross@sales••••.com",
    phone: "+1 (415) ••• ••••",
    rotation: -6,
  },
  {
    id: "6",
    name: "Tom Hassan",
    title: "CTO",
    company: "DataStack",
    initials: "TH",
    avatarGradient: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    email: "t.hassan@data••••.com",
    phone: "+44 20 •••• ••••",
    rotation: 4,
  },
]

const FEATURES = [
  {
    title: "97.2% Verification Rate",
    description: "Every contact is validated in real-time. No bounced emails, no wrong numbers — ever.",
  },
  {
    title: "30-Minute Delivery",
    description: "Paste a LinkedIn URL and receive a verified email or direct phone in under 30 minutes.",
  },
  {
    title: "Zero Subscription",
    description: "Pay $0.20 per email or $1.00 per phone. No monthly fee, no contracts, no surprises.",
  },
]

const STATS = [
  { value: "4,200+", label: "Sales teams trust us" },
  { value: "2.4M+", label: "Contacts delivered" },
  { value: "97.2%", label: "Verification accuracy" },
]

export function FinalCTA() {
  const router = useRouter()

  return (
    <ImageCarouselHero
      subtitle="Trusted by 4,200+ Sales Teams Worldwide"
      title="Find Anyone's Verified Contact Behind Any LinkedIn Profile"
      accentWords={["Verified Contact"]}
      description="Paste a LinkedIn URL, get a verified email or direct phone number in 30 minutes. No guessing. No subscriptions. Pay only when you get a result."
      ctaText="Start Free — 1 Lookup on Us"
      onCtaClick={() => router.push("/signup")}
      cards={CARDS}
      features={FEATURES}
      stats={STATS}
    />
  )
}
