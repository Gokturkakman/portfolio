"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Code2, Plus } from "lucide-react";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/motion-primitives";
import { useApp } from "@/lib/app-state";
import { projects, ui, type Project } from "@/content/profile";

export default function Work() {
  const { tr } = useApp();
  const [openId, setOpenId] = useState<string | null>(
    projects.find((p) => p.featured)?.id ?? null,
  );

  return (
    <Section id="work">
      <SectionHeader
        index="02"
        title={tr(ui.sections.work)}
        subtitle={tr(ui.sections.workSub)}
      />

      <ul className="border-t border-line">
        {projects.map((p, i) => (
          <Reveal as="li" key={p.id} delay={i * 0.06}>
            <ProjectRow
              project={p}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
              tr={tr}
            />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function ProjectRow({
  project: p,
  open,
  onToggle,
  tr,
}: {
  project: Project;
  open: boolean;
  onToggle: () => void;
  tr: (v: { tr: string; en: string }) => string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative border-b border-line"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Hover'da soldan sağa akan renk yıkaması */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left"
        style={{
          background: `linear-gradient(90deg, ${p.accent[0]}1f, ${p.accent[1]}0d 45%, transparent 78%)`,
        }}
        initial={false}
        animate={{ opacity: hovered || open ? 1 : 0, scaleX: hovered || open ? 1 : 0.94 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <button
        onClick={onToggle}
        aria-expanded={open}
        className="relative flex w-full items-start gap-5 px-1 py-7 text-left sm:items-center sm:gap-8 sm:py-9"
      >
        <span className="mt-1 shrink-0 font-[family-name:var(--font-mono)] text-[11px] tracking-widest text-fg-faint sm:mt-0">
          {p.year}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-display text-2xl transition-colors duration-300 sm:text-4xl">
            <span
              style={{ color: hovered || open ? p.accent[0] : undefined }}
              className="transition-colors duration-300"
            >
              {tr(p.title)}
            </span>
          </h3>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-fg-dim">
            {tr(p.summary)}
          </p>
        </div>

        <span className="hidden shrink-0 flex-wrap justify-end gap-1.5 md:flex md:max-w-[16rem]">
          {p.tags.map((tag) => (
            <span
              key={tag.en}
              className="rounded-md border border-line px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-fg-faint"
            >
              {tr(tag)}
            </span>
          ))}
        </span>

        <span
          className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-fg-dim transition-all duration-300 group-hover:border-current sm:mt-0"
          style={{ color: hovered || open ? p.accent[0] : undefined }}
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid place-items-center"
          >
            <Plus size={14} strokeWidth={1.75} />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden"
          >
            <div className="flex flex-col gap-6 pb-9 pl-1 sm:flex-row sm:pl-[4.5rem]">
              <p className="max-w-2xl flex-1 text-pretty text-base leading-relaxed text-fg-dim">
                {tr(p.detail)}
              </p>

              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <div className="flex flex-wrap gap-1.5 md:hidden">
                  {p.tags.map((tag) => (
                    <span
                      key={tag.en}
                      className="rounded-md border border-line px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-fg-faint"
                    >
                      {tr(tag)}
                    </span>
                  ))}
                </div>
                {p.href && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-sm text-fg transition-colors hover:text-accent"
                  >
                    <ArrowUpRight size={14} strokeWidth={1.75} />
                    {p.href.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {p.repo && (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-sm text-fg-dim transition-colors hover:text-accent"
                  >
                    <Code2 size={14} strokeWidth={1.75} />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
