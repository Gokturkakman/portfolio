"use client";

import { useEffect, useRef } from "react";

/**
 * İsmi parçacıklarla çizen alan.
 *
 * Nasıl çalışıyor:
 *  1. Metin görünmeyen bir canvas'a çizilir.
 *  2. Piksel verisi belirli aralıklarla taranır; dolu her piksel bir hedef olur.
 *  3. Parçacıklar rastgele yerlerden doğar ve yaylanarak hedeflerine oturur.
 *  4. İmleç yaklaşınca itilir, uzaklaşınca geri toplanır.
 *
 * Three.js yerine 2D canvas: aynı görsel etki, ~0 kB ek paket, mobilde daha akıcı.
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  size: number;
  /** 0 = kor rengi, 1 = kâğıt rengi: parçacıklar arası renk dağılımı */
  tone: number;
  /** Yaylanma sertliği; hafif çeşitlilik hareketi organik yapar */
  ease: number;
};

const MAX_PARTICLES = 6000;
const POINTER_RADIUS = 130;
/** İtme kuvveti: yüksek tutmak parçacıkları savurup ismi okunmaz yapıyor. */
const POINTER_FORCE = 210;
/** Tek karede eklenebilecek en büyük hız; savrulmayı sınırlar. */
const MAX_IMPULSE = 5.5;

export default function ParticleName({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = true;
    let spawnedAt = 0;

    const pointer = { x: -9999, y: -9999, active: false };

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        accent: styles.getPropertyValue("--accent").trim() || "#e8853a",
        accent2: styles.getPropertyValue("--accent-2").trim() || "#f2c14e",
        fg: styles.getPropertyValue("--fg").trim() || "#f4efe6",
      };
    };

    let colors = readColors();

    /** Metni ölç, piksellere böl, parçacık hedeflerini üret. */
    const build = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Örnekleme için ayrı, küçük bir canvas kullanıyoruz: piksel okuma pahalı.
      const sampleScale = width > 900 ? 0.5 : 0.72;
      const sw = Math.max(1, Math.floor(width * sampleScale));
      const sh = Math.max(1, Math.floor(height * sampleScale));

      const off = document.createElement("canvas");
      off.width = sw;
      off.height = sh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      // Metni kutuya sığdır
      const displayFont = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-display-var")
        .trim();
      const family = `${displayFont ? `${displayFont}, ` : ""}Georgia, serif`;

      let fontSize = sh * 0.9;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      for (let i = 0; i < 24; i++) {
        octx.font = `400 ${fontSize}px ${family}`;
        if (octx.measureText(text).width <= sw * 0.94) break;
        fontSize *= 0.94;
      }

      octx.clearRect(0, 0, sw, sh);
      octx.fillStyle = "#fff";
      octx.fillText(text, sw / 2, sh / 2);

      const data = octx.getImageData(0, 0, sw, sh).data;

      // Yoğunluğu parçacık bütçesine göre ayarla
      const targets: { x: number; y: number }[] = [];
      let step = width > 900 ? 2 : 3;
      for (let attempt = 0; attempt < 6; attempt++) {
        targets.length = 0;
        for (let y = 0; y < sh; y += step) {
          for (let x = 0; x < sw; x += step) {
            if (data[(y * sw + x) * 4 + 3] > 128) {
              targets.push({ x: (x / sw) * width, y: (y / sh) * height });
            }
          }
        }
        if (targets.length <= MAX_PARTICLES) break;
        step += 1;
      }

      const next: Particle[] = targets.map((t, i) => {
        const prev = particles[i];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(width, height) * (0.6 + Math.random() * 0.5);
        return {
          x: prev ? prev.x : width / 2 + Math.cos(angle) * dist,
          y: prev ? prev.y : height / 2 + Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          tx: t.x,
          ty: t.y,
          size: 1.15 + Math.random() * 1.05,
          tone: Math.random(),
          ease: 0.095 + Math.random() * 0.05,
        };
      });

      particles = next;
      spawnedAt = performance.now();
    };

    /**
     * Düz metin başlığından parçacıklara geçiş.
     *
     * Kurulumun başarılı olması yetmez, tek kare çizilmesi de yetmez: sekme
     * arka plandaysa ya da requestAnimationFrame kısıtlanmışsa parçacıklar
     * daha uçuş hâlindeyken donup kalır ve isim okunmaz olurdu. Bu yüzden
     * geçiş, parçacıklar gerçekten hedeflerine oturduğunda yapılıyor.
     */
    let handedOff = false;
    const CONVERGED_PX = 10;

    const handoffWhenReadable = () => {
      if (handedOff || particles.length === 0) return;
      // Tüm diziyi taramaya gerek yok: eşit aralıklı bir örneklem yeterli
      const stride = Math.max(1, Math.floor(particles.length / 24));
      let sum = 0;
      let n = 0;
      for (let i = 0; i < particles.length; i += stride) {
        const p = particles[i];
        sum += Math.hypot(p.tx - p.x, p.ty - p.y);
        n++;
      }
      if (sum / n > CONVERGED_PX) return;
      handedOff = true;
    };

    const draw = (now: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      // İlk saniyede parçacıklar yerine oturuyor; hafif bir "toplanma" hissi
      const settle = Math.min(1, (now - spawnedAt) / 1200);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Hedefe yaylan
        p.vx += (p.tx - p.x) * p.ease;
        p.vy += (p.ty - p.y) * p.ease;

        // İmleç itmesi: mesafeyle doğrusal azalır, tek karede tavanı var
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < POINTER_RADIUS * POINTER_RADIUS && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const falloff = 1 - d / POINTER_RADIUS;
            const force = Math.min(POINTER_FORCE * falloff * falloff / d, MAX_IMPULSE);
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }

        // Sürtünme
        p.vx *= 0.8;
        p.vy *= 0.8;
        p.x += p.vx;
        p.y += p.vy;

        // Hızlı parçacıklar kor rengine kayar: hareketi görünür kılar
        const speed = Math.min(1, (Math.abs(p.vx) + Math.abs(p.vy)) / 6);
        const heat = Math.max(speed, 1 - settle);

        if (heat > 0.1) {
          ctx.fillStyle = p.tone > 0.5 ? colors.accent : colors.accent2;
          ctx.globalAlpha = 0.6 + heat * 0.4;
        } else {
          ctx.fillStyle = colors.fg;
          ctx.globalAlpha = 0.62 + p.tone * 0.34;
        }

        const r = p.size * (1 + heat * 0.6);
        ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
      }

      ctx.globalAlpha = 1;
      handoffWhenReadable();
      raf = requestAnimationFrame(draw);
    };

    /** Hareket azaltma tercihinde: parçacık yok, düz metin çiz. */
    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.fillStyle = colors.fg;
        ctx.globalAlpha = 0.5 + p.tone * 0.35;
        ctx.fillRect(p.tx, p.ty, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      // Statik çizimde parçacıklar zaten hedeflerinde
      if (particles.length) handedOff = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };
    /**
     * Dokunmatikte "hover" yok: parmak değmeden itme olmaz, bu normal.
     * Ama varsayılan `touch-action` yüzünden tarayıcı parmağı sürüklemeyi
     * kaydırma jesti sanıp `pointermove` akışını daha başlamadan kesiyor.
     * Canvas'a `touch-action: none` verip parmağı canvas'a yakalıyoruz;
     * kaldırınca (`pointerup`/`pointercancel`) itme de bitiyor.
     */
    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      onPointerMove(e);
    };

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        if (reduced) drawStatic();
      }, 140);
    };

    // Tema değişince renkleri tazele
    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      if (reduced) drawStatic();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Yazı tipi geç yüklenirse metin ölçüsü değişir: yeniden kur
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        build();
        if (reduced) drawStatic();
      });
    }

    build();

    if (reduced) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(draw);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("pointerup", onPointerLeave);
      canvas.addEventListener("pointercancel", onPointerLeave);
    }

    window.addEventListener("resize", onResize);

    // Sekme arka plandayken CPU yakma
    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        spawnedAt = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerup", onPointerLeave);
      canvas.removeEventListener("pointercancel", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
    };
  }, [text]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/*
        Ekran okuyucular ve arama motorları için gerçek başlık: baştan
        görsel olarak gizli, hiç yanıp sönmüyor. JS hiç çalışmazsa
        (script kapalı, paket yüklenemedi) aşağıdaki <noscript> devreye
        girip ismi düz metin olarak gösteriyor.
      */}
      <h1 className="name-visually-hidden text-display absolute inset-0 flex items-center text-[clamp(2.75rem,11vw,9rem)]">
        {text}
      </h1>
      <noscript>
        <h1 className="text-display absolute inset-0 flex items-center text-[clamp(2.75rem,11vw,9rem)]">
          {text}
        </h1>
      </noscript>
      <canvas
        ref={canvasRef}
        className="relative block h-full w-full touch-none"
        aria-hidden
      />
    </div>
  );
}
