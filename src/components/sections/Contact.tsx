"use client";

import { useState } from "react";
import { ArrowUp, ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { Section, SectionHeader } from "@/components/Section";
import { Magnetic, Reveal } from "@/components/motion-primitives";
import { useApp } from "@/lib/app-state";
import { identity, socials, ui, type SocialKey } from "@/content/profile";

/**
 * lucide-react marka logolarını (telif nedeniyle) barındırmıyor; GitHub/
 * LinkedIn/Instagram için Simple Icons'un tekli-path glifleri kullanılıyor.
 */
function IconGitHub(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function IconLinkedIn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.163 6.163 0 1 0 0 12.326 6.163 6.163 0 0 0 0-12.326zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

const socialIcons: Record<SocialKey, (props: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  github: IconGitHub,
  linkedin: IconLinkedIn,
  instagram: IconInstagram,
  email: (props) => <Mail {...props} strokeWidth={1.75} fill="none" />,
  x: (props) => <ArrowUpRight {...props} strokeWidth={1.75} fill="none" />,
  youtube: (props) => <ArrowUpRight {...props} strokeWidth={1.75} fill="none" />,
};

export default function Contact() {
  const { tr } = useApp();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* pano izni yok: mailto zaten var */
    }
  };

  return (
    <>
      {/* Kapanış bölümü kağıda döner: sayfa boyunca aynı is-siyah yoğunlukta
          kalmak yerine, son eylem burada tek bir kontrast molasıyla öne çıkıyor. */}
      <div
        className="bg-bg text-fg"
        style={
          {
            "--bg": "var(--paper)",
            "--bg-raised": "#fffdf8",
            "--fg": "var(--ink-000)",
            "--fg-dim": "#5c5349",
            "--fg-faint": "#8d8377",
            "--line": "rgb(23 19 15 / 0.1)",
            "--line-strong": "rgb(23 19 15 / 0.19)",
          } as React.CSSProperties
        }
      >
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
          <ul className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {socials.map((s) => {
              const Icon = socialIcons[s.key];
              return (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target={s.key === "email" ? undefined : "_blank"}
                    rel="noreferrer noopener"
                    className="ember-glow group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl border border-line bg-bg px-6 py-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-bg-raised text-fg-dim transition-colors duration-300 group-hover:border-accent group-hover:text-accent">
                      <Icon className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-medium">{tr(s.label)}</span>
                      <span className="mt-0.5 block truncate font-[family-name:var(--font-mono)] text-[11px] text-fg-faint">
                        {s.handle}
                      </span>
                    </span>

                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.5}
                      className="shrink-0 text-fg-faint transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Section>
      </div>

      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-6 px-[var(--gutter)] py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-fg-faint">
            © {new Date().getFullYear()} {identity.name}. {tr(ui.footer.rights)}
          </p>

          <p className="text-[12px] text-fg-faint">
            {tr(ui.footer.built)} - Next.js, Canvas, Claude
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
