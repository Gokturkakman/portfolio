"use client";

import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/motion-primitives";
import { useApp } from "@/lib/app-state";
import { timeline, ui } from "@/content/profile";

export default function Path() {
  const { tr } = useApp();

  return (
    <Section id="path">
      <SectionHeader index="03" title={tr(ui.sections.path)} />

      <ol className="relative">
        {/* Dikey çizgi */}
        <span
          aria-hidden
          className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/60 via-line-strong to-transparent sm:left-[calc(9rem+7px)]"
        />

        {timeline.map((m, i) => (
          <Reveal as="li" key={i} delay={i * 0.08}>
            <div className="relative flex flex-col gap-1 py-8 pl-8 sm:flex-row sm:gap-10 sm:pl-0">
              {/* Nokta */}
              <span
                aria-hidden
                className="absolute left-0 top-[2.35rem] grid h-[15px] w-[15px] place-items-center rounded-full border border-line-strong bg-bg sm:left-36"
              >
                <span
                  className={`h-[5px] w-[5px] rounded-full ${
                    i === 0 ? "bg-accent" : "bg-fg-faint"
                  }`}
                />
              </span>

              <span className="w-36 shrink-0 pt-1 font-[family-name:var(--font-mono)] text-[11px] tracking-widest text-fg-faint">
                {m.period}
              </span>

              <div className="sm:pl-10">
                <h3 className="text-display text-2xl sm:text-3xl">{tr(m.title)}</h3>
                <p className="mt-1 text-sm text-accent">{m.org}</p>
                <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-fg-dim">
                  {tr(m.body)}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
