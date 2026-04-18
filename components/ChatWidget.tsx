"use client";

import {
  useState, useRef, useEffect, useCallback, KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Minimize2, MessageCircle, RotateCcw } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
interface Message {
  id:      string;
  role:    "user" | "assistant";
  content: string;
}

/* ── Suggested prompts ──────────────────────────────────────── */
const SUGGESTIONS = [
  "How does pricing work?",
  "How long does delivery take?",
  "What's a free credit?",
  "How do I submit an order?",
];

/* ── uid ────────────────────────────────────────────────────── */
let _id = 0;
const uid = () => `m${++_id}`;

/* ════════════════════════════════════════════════════════════════
   Root
═══════════════════════════════════════════════════════════════ */
export function ChatWidget() {
  const [open,      setOpen]      = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const abortRef    = useRef<AbortController | null>(null);

  /* scroll to bottom on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  /* focus input when opened */
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 280);
    }
  }, [open, minimized]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setError(null);
    setStreaming(false);
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const asstId = uid();

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    // Optimistic assistant message
    setMessages((prev) => [...prev, { id: asstId, role: "assistant", content: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chatbot", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  ctrl.signal,
        body:    JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: trimmed },
          ],
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const dec    = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === asstId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError("Something went wrong. Try again.");
      setMessages((prev) => prev.filter((m) => m.id !== asstId));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* ── Chat panel ───────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 16, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
            className="fixed z-50 flex flex-col bottom-[101px] sm:bottom-[112px]"
            style={{
              right:        "1.5rem",
              width:        "min(440px, calc(100vw - 32px))",
              height:       minimized ? "auto" : "min(620px, calc(100dvh - 120px))",
              borderRadius: 20,
              background:   "var(--surface)",
              border:       "1px solid var(--border)",
              boxShadow:    "0 24px 64px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)",
              overflow:     "hidden",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5 shrink-0"
              style={{
                background:   "var(--elevated)",
                borderBottom: minimized ? "none" : "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                  }}
                >
                  <span className="text-[15px]">⚡</span>
                  {/* online dot */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                    style={{
                      background:   "#10b981",
                      borderColor:  "var(--elevated)",
                    }}
                  />
                </div>
                <div>
                  <p
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
                  >
                    StealthConnect AI
                  </p>
                  <p className="text-[11px] leading-tight" style={{ color: "#10b981" }}>
                    Online · Replies instantly
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    title="New conversation"
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-60"
                    style={{ color: "var(--fg-subtle)" }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setMinimized((v) => !v)}
                  title={minimized ? "Expand" : "Minimize"}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-60"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Close"
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-60"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence>
              {!minimized && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1, flex: 1 }}
                  exit={{    height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col min-h-0 flex-1"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">

                    {/* Welcome */}
                    {isEmpty && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div
                          className="flex items-start gap-3 mb-5"
                        >
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                          >
                            <span className="text-[13px]">⚡</span>
                          </div>
                          <div
                            className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%]"
                            style={{
                              background: "var(--elevated)",
                              border:     "1px solid var(--border)",
                            }}
                          >
                            <p className="text-[13.5px] leading-relaxed mb-0" style={{ color: "var(--fg)" }}>
                              Hey there! 👋 I'm the StealthConnect assistant.
                            </p>
                            <p className="text-[13px] leading-relaxed mt-1" style={{ color: "var(--fg-muted)" }}>
                              Ask me anything about pricing, how it works, or getting started.
                            </p>
                          </div>
                        </div>

                        {/* Suggestion pills */}
                        <div className="flex flex-wrap gap-2 pl-10">
                          {SUGGESTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => send(s)}
                              className="text-[12px] font-medium px-3 py-1.5 rounded-full transition-all hover:opacity-80 active:scale-[0.97]"
                              style={{
                                background: "var(--elevated)",
                                border:     "1px solid var(--border)",
                                color:      "var(--fg-muted)",
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, i) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        {msg.role === "assistant" && (
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mb-0.5"
                            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                          >
                            <span className="text-[11px]">⚡</span>
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className="max-w-[82%] px-3.5 py-2.5 text-[13.5px] leading-relaxed"
                          style={{
                            borderRadius:
                              msg.role === "user"
                                ? "18px 18px 4px 18px"
                                : "18px 18px 18px 4px",
                            background:
                              msg.role === "user"
                                ? "var(--brand)"
                                : "var(--elevated)",
                            color:
                              msg.role === "user"
                                ? "#ffffff"
                                : "var(--fg)",
                            border:
                              msg.role === "user"
                                ? "none"
                                : "1px solid var(--border)",
                          }}
                        >
                          {msg.content === "" && msg.role === "assistant" ? (
                            <TypingDots />
                          ) : (
                            msg.content
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Error */}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-[12px] px-3 py-2 rounded-lg"
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          color:      "#ef4444",
                          border:     "1px solid rgba(239,68,68,0.15)",
                        }}
                      >
                        {error}
                      </motion.p>
                    )}

                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div
                    className="px-3 pb-3 pt-2.5 shrink-0"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <div
                      className="flex items-end gap-2 px-3 py-2 rounded-2xl transition-all"
                      style={{
                        background: "var(--elevated)",
                        border:     "1.5px solid var(--border)",
                      }}
                      onFocus={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.5)";
                      }}
                      onBlur={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      }}
                    >
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                        }}
                        onKeyDown={onKey}
                        placeholder="Ask a question…"
                        rows={1}
                        disabled={streaming}
                        className="flex-1 bg-transparent resize-none outline-none text-[13.5px] leading-relaxed placeholder:text-[var(--fg-subtle)] disabled:opacity-50"
                        style={{
                          color:      "var(--fg)",
                          fontFamily: "var(--font-body)",
                          minHeight:  "24px",
                          maxHeight:  "100px",
                        }}
                      />
                      <button
                        onClick={() => send(input)}
                        disabled={!input.trim() || streaming}
                        className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0 transition-all disabled:opacity-30 active:scale-[0.93]"
                        style={{
                          background: input.trim() && !streaming
                            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                            : "var(--border)",
                        }}
                      >
                        <Send
                          className="w-3.5 h-3.5"
                          style={{ color: input.trim() && !streaming ? "#fff" : "var(--fg-subtle)" }}
                        />
                      </button>
                    </div>
                    <p
                      className="text-center text-[10.5px] mt-1.5"
                      style={{ color: "var(--fg-subtle)" }}
                    >
                      Press Enter to send · Shift+Enter for new line
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ──────────────────────────────────────────────── */}
      <motion.button
        onClick={() => { setOpen((v) => !v); setMinimized(false); }}
        whileHover={{ scale: 1.06 }}
        whileTap={{   scale: 0.94 }}
        className="fixed z-50 rounded-2xl flex items-center justify-center shadow-lg w-[65px] h-[65px] sm:w-[76px] sm:h-[76px]"
        style={{ bottom: "1.5rem", right: "1.5rem" }}
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
          boxShadow:  "0 8px 28px rgba(139,92,246,0.45), 0 2px 8px rgba(0,0,0,0.2)",
        }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{    rotate: 90,  opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
            >
              <X className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90,  opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{    rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="relative"
            >
              <MessageCircle className="w-8 h-8 text-white" strokeWidth={2} />
              {/* unread dot */}
              {!open && (
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                  style={{
                    background:  "#10b981",
                    borderColor: "#8b5cf6",
                    animation:   "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
                  }}
                />
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

/* ── Typing dots ─────────────────────────────────────────────── */
function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--fg-subtle)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration:   0.9,
            repeat:     Infinity,
            delay:      i * 0.18,
            ease:       "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
