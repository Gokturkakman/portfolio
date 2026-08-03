"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Eraser, Sparkles, X } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { identity, ui } from "@/content/profile";

type Msg = { id: string; role: "user" | "assistant"; content: string };

const uid = () => Math.random().toString(36).slice(2);

export default function ChatDock() {
  const { tr, lang, chatOpen, setChatOpen } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Yeni içerik gelince en alta kay
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (chatOpen) setTimeout(() => inputRef.current?.focus(), 320);
  }, [chatOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && chatOpen) setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, setChatOpen]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setError(null);
    setInput("");

    const userMsg: Msg = { id: uid(), role: "user", content: trimmed };
    const assistantId = uid();
    const history = [...messages, userMsg];

    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          lang,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.message ?? "request_failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error && err.message !== "request_failed"
          ? err.message
          : tr(ui.chat.error));
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const clear = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  };

  return (
    <>
      {/* Yüzen düğme */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            key="dock-fab"
            onClick={() => setChatOpen(true)}
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05 }}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-medium text-bg shadow-[0_8px_32px_-8px_var(--glow)] sm:bottom-7 sm:right-7"
            aria-label={tr(ui.chat.title)}
          >
            <Sparkles size={15} strokeWidth={2} />
            <span className="hidden sm:inline">{tr(ui.chat.title)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              key="dock-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm sm:hidden"
            />

            <motion.div
              key="dock-panel"
              role="dialog"
              aria-label={tr(ui.chat.title)}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="surface fixed inset-x-0 bottom-0 z-50 flex h-[86dvh] flex-col overflow-hidden rounded-t-3xl sm:inset-x-auto sm:bottom-7 sm:right-7 sm:h-[min(38rem,78dvh)] sm:w-[26.5rem] sm:rounded-3xl"
            >
              {/* Başlık */}
              <header className="flex items-start gap-3 border-b border-line px-5 py-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
                  <Sparkles size={15} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[14px] font-medium leading-tight">
                    {tr(ui.chat.title)}
                  </h2>
                  <p className="mt-0.5 text-[11px] leading-snug text-fg-faint">
                    {tr(ui.chat.subtitle)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={clear}
                      className="grid h-7 w-7 place-items-center rounded-md text-fg-faint transition-colors hover:text-fg"
                      aria-label={tr(ui.chat.clear)}
                    >
                      <Eraser size={14} strokeWidth={1.75} />
                    </button>
                  )}
                  <button
                    onClick={() => setChatOpen(false)}
                    className="grid h-7 w-7 place-items-center rounded-md text-fg-faint transition-colors hover:text-fg"
                    aria-label={tr(ui.a11y.close)}
                  >
                    <X size={15} strokeWidth={1.75} />
                  </button>
                </div>
              </header>

              {/* Konuşma */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
              >
                {messages.length === 0 && (
                  <div className="space-y-4 py-2">
                    <p className="text-pretty text-[14px] leading-relaxed text-fg-dim">
                      {tr({
                        tr: `${identity.name} hakkında ne merak ediyorsun? Şunlarla başlayabilirsin:`,
                        en: `What do you want to know about ${identity.name}? You could start here:`,
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ui.chat.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => send(tr(s))}
                          className="rounded-full border border-line px-3 py-1.5 text-left text-[12px] text-fg-dim transition-colors duration-200 hover:border-accent hover:text-accent"
                        >
                          {tr(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={m.role === "user" ? "flex justify-end" : ""}
                  >
                    {m.role === "user" ? (
                      <p className="max-w-[86%] text-pretty rounded-2xl rounded-br-md bg-fg px-3.5 py-2.5 text-[13.5px] leading-relaxed text-bg">
                        {m.content}
                      </p>
                    ) : (
                      <div className="flex gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <p className="text-pretty whitespace-pre-wrap text-[13.5px] leading-relaxed text-fg-dim">
                          {m.content}
                          {busy && !m.content && (
                            <span className="text-fg-faint">
                              {tr(ui.chat.thinking)}
                              <span className="animate-caret">…</span>
                            </span>
                          )}
                          {busy && m.content && (
                            <span className="animate-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-accent align-baseline" />
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {error && (
                  <p className="rounded-xl border border-line bg-bg-sunken px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-dim">
                    {error}
                  </p>
                )}
              </div>

              {/* Giriş */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="border-t border-line px-4 py-3"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-line bg-bg-sunken px-3 py-2 transition-colors focus-within:border-line-strong">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder={tr(ui.chat.placeholder)}
                    className="max-h-[120px] flex-1 resize-none bg-transparent py-1 text-[13.5px] leading-relaxed outline-none placeholder:text-fg-faint"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || busy}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent text-bg transition-opacity disabled:opacity-30"
                    aria-label={tr(ui.chat.send)}
                  >
                    <ArrowUp size={14} strokeWidth={2.25} />
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-fg-faint">
                  {tr(ui.chat.disclaimer)}
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
