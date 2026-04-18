import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";

interface FloatingConsultButtonProps {
  buttonSize?: number;
  smButtonSize?: number;
  imageSize?: number;
  imageSrc?: string;
  imageAlt?: string;
  revolvingText?: string;
  revolvingSpeed?: number;
  popupHeading?: string;
  popupDescription?: string;
  popupBadgeText?: string;
  ctaButtonText?: string;
  ctaButtonAction?: () => void;
  position?: {
    bottom?: string;
    right?: string;
    left?: string;
    top?: string;
  };
}

export const FloatingConsultButton = ({
  buttonSize,
  smButtonSize: smButtonSizeProp,
  imageSize,
  imageSrc = "/consultant-avatar.jpg",
  imageAlt = "Consultant",
  revolvingText = "FREE 30 MINUTES - CONSULT - ",
  revolvingSpeed = 10,
  popupHeading = "30-minutes call",
  popupDescription = "A brief free call to discuss your project.",
  popupBadgeText = "Free",
  ctaButtonText = "Book a call",
  ctaButtonAction = () => {},
  position = { bottom: "2rem", right: "2rem" },
}: FloatingConsultButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const lgButtonSize = buttonSize || 72;
  const smButtonSize = smButtonSizeProp ?? (buttonSize ? Math.round(buttonSize * 0.8) : 58);
  const lgImageSize = imageSize || 42;
  const smImageSize = imageSize ? Math.round(imageSize * 0.833) : 35;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Popup Modal — white card */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed z-[60]"
            style={{
              bottom: `calc(${position.bottom ?? "5.5rem"} + ${lgButtonSize}px + 0.75rem)`,
              right: position.right ?? "1.5rem",
              width: "min(340px, calc(100vw - 2rem))",
              background: "white",
              borderRadius: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
              padding: "1.75rem",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="8" x2="24" y2="24" />
                <line x1="24" y1="8" x2="8" y2="24" />
              </svg>
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                <h3
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#000000",
                    lineHeight: 1.2,
                    fontFamily: "var(--font-display)",
                    margin: 0,
                  }}
                >
                  {popupHeading}
                </h3>
                <span
                  style={{
                    padding: "5px 14px",
                    border: "2px solid #000000",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#000000",
                    background: "transparent",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-body)",
                    flexShrink: 0,
                  }}
                >
                  {popupBadgeText}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  color: "#4b5563",
                  fontFamily: "var(--font-body)",
                  margin: 0,
                }}
              >
                {popupDescription}
              </p>

              {/* CTA Button */}
              <button
                onClick={ctaButtonAction}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: 999,
                  background: "#000000",
                  border: "none",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1f2937")}
                onMouseLeave={e => (e.currentTarget.style.background = "#000000")}
              >
                {ctaButtonText}
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="fixed z-50" style={position}>
        <m.div
          className="relative cursor-pointer group"
          style={{
            width: `clamp(${smButtonSize}px, 8vw, ${lgButtonSize}px)`,
            height: `clamp(${smButtonSize}px, 8vw, ${lgButtonSize}px)`,
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Rotating text ring */}
          <m.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: revolvingSpeed, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <path
                  id="circlePath"
                  d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                />
              </defs>
              <text style={{ fontSize: "20.4px", fontWeight: 600 }} fill="rgba(0,0,0,0.55)">
                <textPath href="#circlePath" startOffset="0%">
                  {revolvingText}
                </textPath>
              </text>
            </svg>
          </m.div>

          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow"
              style={{
                width: `clamp(${smImageSize}px, 5vw, ${lgImageSize}px)`,
                height: `clamp(${smImageSize}px, 5vw, ${lgImageSize}px)`,
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
              }}
            >
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>
        </m.div>
      </div>
    </>
  );
};
