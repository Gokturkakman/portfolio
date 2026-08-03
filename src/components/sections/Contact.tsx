"use client";

import { useState } from "react";
import { ArrowUp, ArrowUpRight, Check, Copy } from "lucide-react";
import { Section, SectionHeader } from "@/components/Section";
import { Magnetic, Reveal } from "@/components/motion-primitives";
import { useApp } from "@/lib/app-state";
import { identity, socials, ui } from "@/content/profile";

export default function Contact() {
  const { tr } = useApp();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* pano izni yok — mailto zaten var */
    }
  };

  return (
    <>
      <Section id="contact" className="pb-16 sm:pb-20">
        <SectionHeader
          index="05"
          title={tr(ui.sections.contact)}
          subtitle={tr(ui.sections.contactSub)}
        />

        <Reveal>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={`mailto:${identity.email}`}
              className="text-display group inline-flex items-baseline gap-3 text-3xl transition-colors duration-300 hover:text-accent sm:text-5xl lg:text-6xl"
            >
              <span className="break-all">{identity.email}</span>
              <ArrowUpRight
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                size={28}
                strokeWidth={1.25}
              />
            </a>

            <button
              onClick={copy}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[12px] text-fg-dim transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              {copied ? (
                <>
                  <Check size={12} strokeWidth={2} />
                  {tr(ui.palette.copied)}
                </>
              ) : (
                <>
                  <Copy size={12} strokeWidth={1.75} />
                  {tr({ tr: "Kopyala", en: "Copy" })}
                </>
              )}
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {socials.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target={s.key === "email" ? undefined : "_blank"}
                  rel="noreferrer noopener"
                  className="group flex h-full items-center justify-between gap-4 bg-bg px-5 py-5 transition-colors duration-300 hover:bg-bg-raised"
                >
                  <span>
                    <span className="block text-[15px] font-medium">{s.label}</span>
                    <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-[11px] text-fg-faint">
                      {s.handle}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.5}
                    className="shrink-0 text-fg-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-6 px-[var(--gutter)] py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-fg-faint">
            © {new Date().getFullYear()} {identity.name}. {tr(ui.footer.rights)}
          </p>

          <p className="text-[12px] text-fg-faint">
            {tr(ui.footer.built)} — Next.js, Canvas, Claude
          </p>

          <Magnetic strength={0.2}>
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 text-[12px] text-fg-dim transition-colors duration-200 hover:text-accent"
            >
              <ArrowUp size={13} strokeWidth={1.75} />
              {tr(ui.footer.top)}
            </a>
          </Magnetic>
        </div>
      </footer>
    </>
  );
}
