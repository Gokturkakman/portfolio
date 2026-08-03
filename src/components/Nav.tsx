"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Menu, Moon, Sun, X, Sparkles } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { identity, ui } from "@/content/profile";
import { Magnetic } from "./motion-primitives";

const LINKS = [
  { id: "about", label: ui.nav.about },
  { id: "work", label: ui.nav.work },
  { id: "path", label: ui.nav.path },
  { id: "play", label: ui.nav.play },
  { id: "contact", label: ui.nav.contact },
] as const;

export default function Nav() {
  const { tr, lang, toggleLang, theme, toggleTheme, setPaletteOpen, setChatOpen, mounted } =
    useApp();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Görünürdeki bölümü izle — nav'daki aktif işaret için
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-line bg-bg/72 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <div className="mx-auto flex h-16 max-w-[92rem] items-center gap-6 px-[var(--gutter)]">
          {/* Monogram */}
          <a
            href="#top"
            className="group relative flex shrink-0 items-center gap-2.5"
            aria-label={identity.name}
          >
            <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-line-strong bg-bg-raised font-[family-name:var(--font-display)] text-[13px] leading-none text-accent transition-colors duration-300 group-hover:border-accent">
              {identity.initials}
            </span>
            <span className="hidden text-[13px] font-medium tracking-tight sm:block">
              {identity.name}
            </span>
          </a>

          {/* Durum rozeti */}
          <span className="hidden items-center gap-2 text-[11px] text-fg-faint xl:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="status-dot absolute inline-flex h-full w-full rounded-full bg-accent" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {tr(identity.status)}
          </span>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="relative px-3 py-2 text-[13px] text-fg-dim transition-colors duration-200 hover:text-fg"
              >
                {tr(l.label)}
                {active === l.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-px bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            {/* Komut paleti */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-fg-faint transition-colors duration-200 hover:border-line-strong hover:text-fg-dim md:flex"
              aria-label="Command palette"
            >
              <Command size={12} strokeWidth={1.75} />
              <span className="font-[family-name:var(--font-mono)]">K</span>
            </button>

            {/* Dil */}
            <button
              onClick={toggleLang}
              className="rounded-lg border border-line px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-fg-dim transition-colors duration-200 hover:border-accent hover:text-accent"
              aria-label={tr(ui.a11y.lang)}
            >
              {mounted ? lang : "tr"}
            </button>

            {/* Tema */}
            <button
              onClick={toggleTheme}
              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-line text-fg-dim transition-colors duration-200 hover:border-accent hover:text-accent"
              aria-label={tr(ui.a11y.theme)}
            >
              {mounted && theme === "light" ? (
                <Moon size={14} strokeWidth={1.75} />
              ) : (
                <Sun size={14} strokeWidth={1.75} />
              )}
            </button>

            {/* Asistan */}
            <Magnetic strength={0.2} className="hidden sm:block">
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-fg px-3 py-1.5 text-[12px] font-medium text-bg transition-transform duration-200 hover:scale-[1.03]"
              >
                <Sparkles size={12} strokeWidth={2} />
                {tr(ui.hero.ctaAlt)}
              </button>
            </Magnetic>

            {/* Mobil menü */}
            <button
              onClick={() => setOpen(true)}
              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-line text-fg-dim lg:hidden"
              aria-label={tr(ui.a11y.menu)}
            >
              <Menu size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobil menü paneli */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-bg/90 backdrop-blur-xl"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col gap-1 border-l border-line bg-bg-raised px-8 pt-24"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-6 top-6 grid h-9 w-9 place-items-center rounded-lg border border-line text-fg-dim"
                aria-label={tr(ui.a11y.close)}
              >
                <X size={16} strokeWidth={1.75} />
              </button>

              {LINKS.map((l, i) => (
                <motion.a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="text-display border-b border-line py-4 text-3xl text-fg-dim transition-colors hover:text-accent"
                >
                  {tr(l.label)}
                </motion.a>
              ))}

              <button
                onClick={() => {
                  setOpen(false);
                  setChatOpen(true);
                }}
                className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-bg"
              >
                <Sparkles size={14} strokeWidth={2} />
                {tr(ui.hero.ctaAlt)}
              </button>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
