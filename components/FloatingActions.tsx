"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Msg { id: string; role: "user" | "assistant"; content: string }
let _n = 0;
const uid = () => `m${++_n}`;

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
const IcBolt = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
const IcChat = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IcSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
  </svg>
);
const IcRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>
);
const IcMinus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
    <path d="M5 12h14"/>
  </svg>
);

/* ─── Quick prompts ─────────────────────────────────────────────────────── */
const PROMPTS = [
  "How does pricing work?",
  "How fast is delivery?",
  "What's a free credit?",
];

/* ─── Typing indicator ──────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] py-0.5">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{ width: 5, height: 5, background: "rgba(0,0,0,0.2)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export function FloatingActions() {
  const [visible,    setVisible]    = useState(false);   // delayed mount
  const [chatOpen,   setChatOpen]   = useState(false);
  const [minimized,  setMinimized]  = useState(false);
  const [messages,   setMessages]   = useState<Msg[]>([]);
  const [input,      setInput]      = useState("");
  const [streaming,  setStreaming]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  /* Appear after 2.5s — not immediately annoying */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  /* Scroll chat to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  /* Focus input when chat opens */
  useEffect(() => {
    if (chatOpen && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [chatOpen, minimized]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setError(null);
    setStreaming(false);
  }, []);

  const send = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || streaming) return;

    setError(null);
    const userMsg: Msg = { id: uid(), role: "user", content: t };
    const asstId = uid();

    setMessages(p => [...p, userMsg, { id: asstId, role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: t },
          ],
        }),
      });
      if (!res.ok || !res.body) throw new Error("Failed");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMessages(p => p.map(m => m.id === asstId ? { ...m, content: m.content + chunk } : m));
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError("Something went wrong. Try again.");
      setMessages(p => p.filter(m => m.id !== asstId));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  const openChat = () => { setChatOpen(true); setMinimized(false); };

  return (
    <div className={`fixed flex flex-col items-end gap-2.5 ${chatOpen ? "z-[70]" : "z-[55]"}`} style={{ bottom: "1.5rem", right: "1.5rem" }}>

      {/* ── Chat panel ─────────────────────────────────────────── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            style={{
              width:        "min(380px, calc(100vw - 32px))",
              borderRadius: 20,
              background:   "#ffffff",
              border:       "1px solid rgba(0,0,0,0.08)",
              boxShadow:    "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
              overflow:     "hidden",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: minimized ? "none" : "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div
                  className="relative w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
                >
                  <IcBolt />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: "#10b981", border: "1.5px solid #ffffff" }}
                  />
                </div>
                <div>
                  <p
                    className="text-[12.5px] font-semibold leading-tight"
                    style={{ color: "rgba(0,0,0,0.88)", fontFamily: "var(--font-display)" }}
                  >
                    StealthConnect AI
                  </p>
                  <p className="text-[10.5px] font-medium" style={{ color: "#059669" }}>
                    Online · Replies instantly
                  </p>
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-0.5">
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    title="New conversation"
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                    style={{ color: "rgba(0,0,0,0.3)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,0,0,0.3)")}
                  >
                    <IcRefresh />
                  </button>
                )}
                <button
                  onClick={() => setMinimized(v => !v)}
                  title={minimized ? "Expand" : "Minimize"}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  <IcMinus />
                </button>
                <button
                  onClick={() => setChatOpen(false)}
                  title="Close"
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  <IcClose />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence initial={false}>
              {!minimized && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{    height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  {/* Messages area */}
                  <div
                    className="overflow-y-auto px-4 py-4 flex flex-col gap-3"
                    style={{ height: "min(400px, calc(100dvh - 220px))" }}
                  >
                    {/* Welcome state */}
                    {messages.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col gap-3"
                      >
                        {/* Bot welcome bubble */}
                        <div className="flex items-end gap-2">
                          <div
                            className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mb-0.5"
                            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff" }}
                          >
                            <IcBolt />
                          </div>
                          <div
                            className="px-3.5 py-2.5 text-[13px] leading-relaxed"
                            style={{
                              background:   "rgba(0,0,0,0.04)",
                              border:       "1px solid rgba(0,0,0,0.06)",
                              borderRadius: "16px 16px 16px 4px",
                              color:        "rgba(0,0,0,0.75)",
                              maxWidth:     "88%",
                              fontFamily:   "var(--font-body)",
                            }}
                          >
                            Hey! Ask me anything about pricing, delivery times, or how to get started. I&apos;m here to help.
                          </div>
                        </div>

                        {/* Quick prompts */}
                        <div className="flex flex-wrap gap-1.5 pl-8">
                          {PROMPTS.map(p => (
                            <button
                              key={p}
                              onClick={() => send(p)}
                              className="transition-all duration-150 text-[11.5px] font-medium"
                              style={{
                                background:   "rgba(59,130,246,0.06)",
                                border:       "1px solid rgba(59,130,246,0.25)",
                                borderRadius: 999,
                                padding:      "5px 12px",
                                color:        "#2563eb",
                                fontFamily:   "var(--font-body)",
                                cursor:       "pointer",
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.15)";
                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.35)";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.08)";
                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.2)";
                              }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Messages */}
                    {messages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {msg.role === "assistant" && (
                          <div
                            className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mb-0.5"
                            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", flexShrink: 0 }}
                          >
                            <IcBolt />
                          </div>
                        )}
                        <div
                          className="text-[13px] leading-relaxed px-3.5 py-2.5"
                          style={{
                            maxWidth:     "82%",
                            borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            background:   msg.role === "user"
                              ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                              : "rgba(0,0,0,0.04)",
                            border:       msg.role === "user" ? "none" : "1px solid rgba(0,0,0,0.06)",
                            color:        msg.role === "user" ? "#fff" : "rgba(0,0,0,0.75)",
                            fontFamily:   "var(--font-body)",
                          }}
                        >
                          {msg.content === "" && msg.role === "assistant" ? <TypingDots /> : msg.content}
                        </div>
                      </motion.div>
                    ))}

                    {error && (
                      <p
                        className="text-center text-[11.5px] px-3 py-2 rounded-xl"
                        style={{ background: "rgba(239,68,68,0.06)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}
                      >
                        {error}
                      </p>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input bar */}
                  <div
                    className="px-3 pb-3 pt-2"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <div
                      className="flex items-end gap-2 px-3 py-2 rounded-2xl transition-all duration-200"
                      style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
                    >
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => {
                          setInput(e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                        }}
                        onKeyDown={onKey}
                        placeholder="Ask a question…"
                        rows={1}
                        disabled={streaming}
                        className="flex-1 bg-transparent resize-none outline-none text-[13px] leading-relaxed disabled:opacity-40"
                        style={{
                          color:       "rgba(0,0,0,0.8)",
                          fontFamily:  "var(--font-body)",
                          minHeight:   22,
                          maxHeight:   96,
                          caretColor:  "#3b82f6",
                        }}
                      />
                      <button
                        onClick={() => send(input)}
                        disabled={!input.trim() || streaming}
                        className="shrink-0 flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-30"
                        style={{
                          width:      34,
                          height:     34,
                          background: input.trim() && !streaming
                            ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                            : "rgba(0,0,0,0.06)",
                          color:      input.trim() && !streaming ? "#fff" : "rgba(0,0,0,0.3)",
                          boxShadow:  input.trim() && !streaming ? "0 4px 12px rgba(59,130,246,0.35)" : "none",
                        }}
                      >
                        <IcSend />
                      </button>
                    </div>
                    <p
                      className="text-center mt-1.5 text-[10px]"
                      style={{ color: "rgba(0,0,0,0.25)", fontFamily: "var(--font-body)" }}
                    >
                      Enter to send · Shift+Enter for new line
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating action pills ───────────────────────────────── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="pills"
            className="flex flex-col items-end gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Chat button */}
            <motion.div
              key="chat-pill"
              initial={{ opacity: 0, x: 24, scale: 0.9 }}
              animate={{ opacity: 1, x: 0,  scale: 1   }}
              transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.22 }}
              style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}
            >
              {/* Main toggle button */}
              <motion.button
                onClick={() => chatOpen ? setChatOpen(false) : openChat()}
                whileHover={{ scale: 1.06 }}
                whileTap={{   scale: 0.93 }}
                aria-label={chatOpen ? "Close chat" : "Open chat"}
                className="relative flex items-center justify-center"
                style={{
                  width:        46,
                  height:       46,
                  borderRadius: "50%",
                  background:   chatOpen
                    ? "rgba(0,0,0,0.08)"
                    : "linear-gradient(135deg,#0038FF,#3b82f6)",
                  border:       chatOpen ? "1px solid rgba(0,0,0,0.1)" : "none",
                  color:        chatOpen ? "rgba(0,0,0,0.6)" : "#ffffff",
                  cursor:       "pointer",
                  boxShadow:    chatOpen ? "none" : "0 6px 20px rgba(0,56,255,0.35)",
                  transition:   "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                  flexShrink:   0,
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {chatOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0,   opacity: 1 }}
                      exit={{    rotate: 90,  opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex"
                    >
                      <IcClose />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="chat"
                      initial={{ rotate: 90,  opacity: 0 }}
                      animate={{ rotate: 0,   opacity: 1 }}
                      exit={{    rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex"
                    >
                      <IcChat />
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Unread indicator */}
                {!chatOpen && messages.length === 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 rounded-full"
                    style={{
                      width:      9,
                      height:     9,
                      background: "#CCFF00",
                      border:     "2px solid #0038FF",
                      animation:  "pulse 2.5s cubic-bezier(.4,0,.6,1) infinite",
                    }}
                  />
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
