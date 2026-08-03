"use client";

import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/motion-primitives";
import { useApp } from "@/lib/app-state";
import { about, stack, ui } from "@/content/profile";

export default function About() {
  const { tr } = useApp();

  return (
    <Section id="about">
      <SectionHeader index="01" title={tr(ui.sections.about)} />

      <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        {/* Metin */}
        <div className="space-y-6">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p
                className={
                  i === 0
                    ? "text-pretty text-xl leading-relaxed text-fg sm:text-2xl"
                    : "text-pretty text-base leading-relaxed text-fg-dim"
                }
              >
                {tr(p)}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Hızlı bilgi + yetenekler */}
        <div className="space-y-10">
          <Reveal delay={0.1}>
            <dl className="surface rounded-2xl p-6">
              {about.facts.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-baseline justify-between gap-6 py-3 ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <dt className="text-eyebrow shrink-0">{tr(f.k)}</dt>
                  <dd className="text-right text-sm text-fg">{tr(f.v)}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.16}>
            <h3 className="text-eyebrow mb-5">{tr(ui.sections.stack)}</h3>
            <div className="space-y-5">
              {stack.map((group) => (
                <div key={group.group.en}>
                  <p className="mb-2 text-[12px] text-fg-faint">{tr(group.group)}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-md border border-line bg-bg-raised/60 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[11px] text-fg-dim transition-colors duration-200 hover:border-accent hover:text-accent"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
