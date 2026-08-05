"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/motion-primitives";
import { useApp } from "@/lib/app-state";
import { quiz, ui } from "@/content/profile";

type Phase = "idle" | "asking" | "revealed" | "done";

/**
 * "İki doğru bir yalan": her turda üç iddiadan yalanı bulmaya çalışırsın.
 * İçerik profile.ts içindeki `quiz` dizisinden geliyor.
 */
export default function Play() {
  const { tr } = useApp();
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const item = quiz[round];
  const correct = picked !== null && picked === item?.lieIndex;

  const start = () => {
    setPhase("asking");
    setRound(0);
    setScore(0);
    setPicked(null);
  };

  const pick = (i: number) => {
    if (phase !== "asking") return;
    setPicked(i);
    setPhase("revealed");
    if (i === item.lieIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (round + 1 >= quiz.length) {
      setPhase("done");
    } else {
      setRound((r) => r + 1);
      setPicked(null);
      setPhase("asking");
    }
  };

  const verdict =
    score === quiz.length
      ? ui.game.perfect
      : score >= Math.ceil(quiz.length / 2)
        ? ui.game.good
        : ui.game.bad;

  return (
    <Section id="play">
      <SectionHeader
        index="04"
        title={tr(ui.sections.play)}
        subtitle={tr(ui.sections.playSub)}
      />

      <Reveal>
        <div className="surface relative overflow-hidden rounded-3xl p-7 sm:p-12">
          {/* Köşedeki kısık kor */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60"
            style={{
              background: "radial-gradient(circle, var(--glow), transparent 65%)",
            }}
          />

          {/* initial={false}: ilk panel animasyonsuz gelir: JS gecikirse ya da
              çalışmazsa "Başla" ekranı boş kalmaz. Sonraki geçişler animasyonlu. */}
          <AnimatePresence mode="wait" initial={false}>
            {/* ---------------------------------------------------------- */}
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-start gap-6 py-6"
              >
                <p className="text-display max-w-lg text-3xl sm:text-4xl">
                  {tr({
                    tr: "Üç iddia. İkisi doğru, biri ",
                    en: "Three claims. Two are true, one is a ",
                  })}
                  <span className="accent-italic">
                    {tr({ tr: "yalan", en: "lie" })}
                  </span>
                  .
                </p>
                <button
                  onClick={start}
                  className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-bg transition-transform duration-300 hover:scale-[1.04]"
                >
                  {tr(ui.game.start)}
                </button>
              </motion.div>
            )}

            {/* ---------------------------------------------------------- */}
            {(phase === "asking" || phase === "revealed") && item && (
              <motion.div
                key={`round-${round}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="text-eyebrow">
                    {tr(ui.game.round)} {round + 1} / {quiz.length}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-[11px] text-fg-faint">
                    {tr(ui.game.score)} {score}
                  </span>
                </div>

                <div className="grid gap-3">
                  {item.claims.map((c, i) => {
                    const isLie = i === item.lieIndex;
                    const isPicked = picked === i;
                    const show = phase === "revealed";

                    return (
                      <button
                        key={i}
                        onClick={() => pick(i)}
                        disabled={show}
                        className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${
                          show
                            ? isLie
                              ? "border-accent bg-accent/10"
                              : isPicked
                                ? "border-line-strong bg-bg-sunken opacity-70"
                                : "border-line opacity-45"
                            : "border-line hover:border-accent hover:bg-accent/5"
                        }`}
                      >
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-[family-name:var(--font-mono)] text-[11px] transition-colors ${
                            show && isLie
                              ? "border-accent bg-accent text-bg"
                              : "border-line-strong text-fg-faint group-hover:border-accent group-hover:text-accent"
                          }`}
                        >
                          {show ? (
                            isLie ? (
                              <Check size={13} strokeWidth={2.5} />
                            ) : isPicked ? (
                              <X size={13} strokeWidth={2.5} />
                            ) : (
                              String.fromCharCode(65 + i)
                            )
                          ) : (
                            String.fromCharCode(65 + i)
                          )}
                        </span>
                        <span className="text-pretty text-[15px] leading-relaxed">
                          {tr(c)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {phase === "revealed" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-7 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              correct ? "text-accent" : "text-fg-dim"
                            }`}
                          >
                            {correct ? tr(ui.game.correct) : tr(ui.game.wrong)}
                          </p>
                          <p className="mt-1.5 max-w-lg text-pretty text-sm leading-relaxed text-fg-dim">
                            {tr(item.reveal)}
                          </p>
                        </div>
                        <button
                          onClick={next}
                          className="shrink-0 self-start rounded-full border border-line-strong px-5 py-2.5 text-sm transition-colors duration-300 hover:border-accent hover:text-accent sm:self-auto"
                        >
                          {round + 1 >= quiz.length
                            ? tr({ tr: "Bitir", en: "Finish" })
                            : tr({ tr: "Sonraki", en: "Next" })}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ---------------------------------------------------------- */}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-start gap-5 py-6"
              >
                <span className="text-eyebrow">{tr(ui.game.score)}</span>
                <p className="text-display text-6xl sm:text-7xl">
                  <span className="text-accent">{score}</span>
                  <span className="text-fg-faint"> / {quiz.length}</span>
                </p>
                <p className="max-w-md text-pretty text-lg text-fg-dim">
                  {tr(verdict)}
                </p>
                <button
                  onClick={start}
                  className="flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  <RotateCcw size={14} strokeWidth={1.75} />
                  {tr(ui.game.restart)}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </Section>
  );
}
