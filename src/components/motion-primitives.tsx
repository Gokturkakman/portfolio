"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

/* -------------------------------------------------------------------------- */
/*  Reveal: kaydırınca beliren blok                                           */
/* -------------------------------------------------------------------------- */

/**
 * Önemli kural: içerik hiçbir koşulda gizli kalmamalı.
 *
 * Klasik `initial={{opacity:0}} + whileInView` deseninin sessiz bir tuzağı var:
 * sayfa `#work` gibi bir bağlantıyla ortadan açılırsa ya da gözlemci geç
 * kurulursa, ekranda olan bloklar 0 opaklıkta takılı kalabiliyor. Bu yüzden
 * animasyon "opt-in": blok DOM'a görünür geliyor, yalnızca ekranın altındaysa
 * gizlenip gözlemciye bağlanıyor.
 *
 * React state'i yerine sınıf değiştirme kullanılıyor: her bölüm için yeniden
 * render tetiklemeye gerek yok, iş tamamen CSS geçişinde.
 */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Zaten görünüyorsa hiç dokunma: içerik olduğu gibi kalsın
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.9) return;

    el.classList.add("reveal-armed");

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("reveal-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={className}
      style={
        {
          "--reveal-y": `${y}px`,
          "--reveal-delay": `${delay}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/*  Magnetic: imlece hafifçe yaklaşan buton sarmalayıcı                       */
/* -------------------------------------------------------------------------- */

export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 240, damping: 18, mass: 0.5 }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setOffset({
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
        });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cursor: özel imleç (yalnızca fare + hareket açıkken)                      */
/* -------------------------------------------------------------------------- */

/**
 * İmleç öğeleri her zaman DOM'da; görünürlüğü <html> üstündeki `custom-cursor`
 * sınıfı belirliyor (CSS'te tanımlı). Böylece React state'i ve buna bağlı
 * yeniden render gerekmiyor.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.documentElement.classList.add("custom-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let hovering = false;

    const interactive = "a, button, [role='button'], input, textarea, [data-cursor]";

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = e.target as Element | null;
      const next = Boolean(target?.closest?.(interactive));
      if (next !== hovering) {
        hovering = next;
        ringRef.current?.style.setProperty("--s", next ? "2.1" : "1");
        ringRef.current?.style.setProperty("--o", next ? "1" : "0.55");
      }
    };

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(var(--s, 1))`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="cursor-el pointer-events-none fixed left-0 top-0 z-[70] h-1.5 w-1.5 rounded-full bg-accent"
      />
      <div
        ref={ringRef}
        aria-hidden
        style={{ opacity: "var(--o, 0.55)" }}
        className="cursor-el pointer-events-none fixed left-0 top-0 z-[70] h-8 w-8 rounded-full border border-accent transition-opacity duration-200"
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  ScrollProgress: sayfanın üstündeki ince kor çizgisi                       */
/* -------------------------------------------------------------------------- */

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[65] h-px origin-left bg-accent"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
