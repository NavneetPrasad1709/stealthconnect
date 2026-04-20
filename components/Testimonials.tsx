"use client";

import React from "react";
import { m } from "framer-motion";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    text: "We were burning $800/month on a subscription tool we barely used. Switched to StealthConnect and now we only pay when we actually need contacts. Cut our lead gen cost by 70%.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Briana Patton",
    role: "Head of Sales, Finch",
  },
  {
    text: "Uploaded a CSV of 400 LinkedIn URLs before lunch. By the time I got back, mobile numbers were waiting in my inbox. The 30-minute promise is absolutely real.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Bilal Ahmed",
    role: "SDR Lead, Northwind",
  },
  {
    text: "As a recruiter, direct-dial numbers are gold. $1 per verified mobile is absurd value compared to what I was paying before. No contracts, no minimums — just results.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Saman Malik",
    role: "Senior Recruiter",
  },
  {
    text: "The credits-never-expire thing sounds like a marketing gimmick until you actually need it. I topped up 6 months ago and my balance is still there. Amazing.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Omar Raza",
    role: "Founder, Stackmill",
  },
  {
    text: "I love that I only pay for contacts they actually find. Every other tool charges per lookup whether they hit or miss. This pricing model should be the industry standard.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Zainab Hussain",
    role: "Growth Lead, Orbit",
  },
  {
    text: "The free email validation tier alone is worth signing up for. Cleaned my 2,000-contact newsletter list in minutes and my bounce rate dropped to under 1%.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Aliza Khan",
    role: "Email Marketing Manager",
  },
  {
    text: "I run outbound for a seed-stage startup. We can't afford $500/month contracts. StealthConnect lets me spend $40 when I need it and $0 when I don't. Perfect fit.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Farhan Siddiqui",
    role: "Founder, Veilbox",
  },
  {
    text: "Accuracy is noticeably better than the 'big name' tools. I ran a side-by-side test on 50 profiles and StealthConnect hit rate was 18% higher on direct dials.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sana Sheikh",
    role: "RevOps Manager",
  },
  {
    text: "Signed up, pasted 12 URLs, paid $8, had everything in 22 minutes. This is how sales tools should work — no demos, no annual contracts, just answers.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Hassan Ali",
    role: "Account Executive",
  },
];

const firstColumn  = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn  = testimonials.slice(6, 9);

function TestimonialsColumn({
  className,
  testimonials,
  duration = 10,
}: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) {
  return (
    <div className={className} style={{ overflow: "hidden" }}>
      <m.ul
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="tcol"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <li key={`${index}-${i}`} className="tcard">
                <blockquote>
                  <p>{text}</p>
                  <footer>
                    <img src={image} alt={`Photo of ${name}`} />
                    <div>
                      <cite>{name}</cite>
                      <span>{role}</span>
                    </div>
                  </footer>
                </blockquote>
              </li>
            ))}
          </React.Fragment>
        ))}
      </m.ul>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="testimonials">
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="testimonials__inner"
      >
        <div className="testimonials__header">
          <span className="testimonials__eyebrow">
            <span className="dot" />
            Testimonials
          </span>
          <h2 className="testimonials__title">
            Loved by teams who are{" "}
            <span className="accent">done overpaying.</span>
          </h2>
          <p className="testimonials__lede">
            Founders, recruiters, professionals, and more ditched their bloated
            subscriptions for StealthConnect. Here's what they have to say.
          </p>
        </div>

        <div
          className="testimonials__grid"
          role="region"
          aria-label="Scrolling testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn}  duration={20} />
          <TestimonialsColumn testimonials={secondColumn} className="tcol-hide-md" duration={24} />
          <TestimonialsColumn testimonials={thirdColumn}  className="tcol-hide-lg" duration={22} />
        </div>
      </m.div>
    </section>
  );
}
