"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CornerDownLeft,
  Globe,
  Hash,
  Mail,
  Search,
  Sparkles,
  SunMoon,
} from "lucide-react";
import { useApp } from "@/lib/app-state";
import { identity, socials, ui } from "@/content/profile";

type Item = {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  hint?: string;
  run: () => void;
};

export default function CommandPalette() {
  const {
    tr,
    paletteOpen,
    setPaletteOpen,
    setChatOpen,
    toggleTheme,
    toggleLang,
  } = useApp();

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setPaletteOpen(false);
    setQuery("");
    setCursor(0);
  };

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => {
      close();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const sections: Item[] = [
      { id: "about", label: tr(ui.nav.about) },
      { id: "work", label: tr(ui.nav.work) },
      { id: "path", label: tr(ui.nav.path) },
      { id: "play", label: tr(ui.nav.play) },
      { id: "contact", label: tr(ui.nav.contact) },
    ].map((s) => ({
      ...s,
      group: tr(ui.palette.sections),
      icon: <Hash size={14} strokeWidth={1.75} />,
      run: go(s.id),
    }));

    const actions: Item[] = [
      {
        id: "chat",
        label: tr(ui.palette.openChat),
        group: tr(ui.palette.actions),
        icon: <Sparkles size={14} strokeWidth={1.75} />,
        hint: "⌘J",
        run: () => {
          close();
          setChatOpen(true);
        },
      },
      {
        id: "theme",
        label: tr(ui.palette.toggleTheme),
        group: tr(ui.palette.actions),
        icon: <SunMoon size={14} strokeWidth={1.75} />,
        run: () => {
          toggleTheme();
          close();
        },
      },
      {
        id: "lang",
        label: tr(ui.palette.toggleLang),
        group: tr(ui.palette.actions),
        icon: <Globe size={14} strokeWidth={1.75} />,
        run: () => {
          toggleLang();
          close();
        },
      },
      {
        id: "copy",
        label: copied ? tr(ui.palette.copied) : tr(ui.palette.copyEmail),
        group: tr(ui.palette.actions),
        icon: <Mail size={14} strokeWidth={1.75} />,
        hint: identity.email,
        run: async () => {
          try {
            await navigator.clipboard.writeText(identity.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* pano izni yok */
          }
        },
      },
    ];

    const links: Item[] = socials.map((s) => ({
      id: `link-${s.key}`,
      label: tr(s.label),
      group: tr(ui.palette.links),
      icon: <ArrowUpRight size={14} strokeWidth={1.75} />,
      hint: s.handle,
      run: () => {
        close();
        window.open(s.href, s.key === "email" ? "_self" : "_blank", "noopener");
      },
    }));

    return [...sections, ...actions, ...links];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tr, copied, setChatOpen, toggleTheme, toggleLang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return items;
    return items.filter((i) =>
      `${i.label} ${i.hint ?? ""} ${i.group}`.toLocaleLowerCase("tr").includes(q),
    );
  }, [items, query]);

  // Gruplara böl ama düz indeksi koru: klavye gezinmesi bunun üstünde çalışıyor
  const groups = useMemo(() => {
    const map = new Map<string, { item: Item; index: number }[]>();
    filtered.forEach((item, index) => {
      const list = map.get(item.group) ?? [];
      list.push({ item, index });
      map.set(item.group, list);
    });
    return [...map.entries()];
  }, [filtered]);

  useEffect(() => {
    if (paletteOpen) setTimeout(() => inputRef.current?.focus(), 40);
  }, [paletteOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => (c + 1) % Math.max(filtered.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => (c - 1 + filtered.length) % Math.max(filtered.length, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[cursor]?.run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, filtered, cursor]);

  // Seçili satırı görünür tut
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-bg/70 backdrop-blur-md"
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="surface relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={15} strokeWidth={1.75} className="shrink-0 text-fg-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0); // sorgu değişince seçim başa dönsün
                }}
                placeholder={tr(ui.palette.placeholder)}
                className="w-full bg-transparent py-4 text-[14px] outline-none placeholder:text-fg-faint"
              />
              <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-fg-faint">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[54vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-8 text-center text-[13px] text-fg-faint">
                  {tr(ui.palette.empty)}
                </p>
              )}

              {groups.map(([group, entries]) => (
                <div key={group} className="mb-1">
                  <p className="px-3 pb-1 pt-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-fg-faint">
                    {group}
                  </p>
                  {entries.map(({ item, index }) => (
                    <button
                      key={item.id}
                      data-index={index}
                      onMouseEnter={() => setCursor(index)}
                      onClick={item.run}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        cursor === index
                          ? "bg-accent/12 text-accent"
                          : "text-fg-dim hover:bg-bg-sunken"
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="flex-1 truncate text-[13.5px]">{item.label}</span>
                      {item.hint && (
                        <span className="shrink-0 truncate font-[family-name:var(--font-mono)] text-[10.5px] text-fg-faint">
                          {item.hint}
                        </span>
                      )}
                      {cursor === index && (
                        <CornerDownLeft size={12} strokeWidth={1.75} className="shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
