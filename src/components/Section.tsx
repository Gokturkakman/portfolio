"use client";

import { Reveal } from "./motion-primitives";

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-[92rem] scroll-mt-24 px-[var(--gutter)] py-28 sm:py-36 ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  index,
  title,
  subtitle,
}: {
  /** Sol taraftaki numara, "01" gibi */
  index: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mb-14 sm:mb-20">
      <div className="flex items-baseline gap-4">
        <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.2em] text-accent">
          {index}
        </span>
        <div className="rule flex-1" />
      </div>
      <h2 className="text-display mt-5 text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-fg-dim">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
