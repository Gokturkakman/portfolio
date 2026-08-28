"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-state";
import { ui } from "@/content/profile";

/**
 * Sağ kenarda sabit duran, sitenin uzunluğu boyunca bir "Odysseia" yolculuğu
 * anlatan dar şerit. Karakterin dikey konumu tüm sayfanın kaydırma oranına
 * bağlı (üstte deniz, altta Ithaka); hangi "sahne" çizildiği (yelken,
 * fırtına, ada, sirenler, varış) o an ekranda hangi bölümün olduğuna bağlı.
 *
 * Geniş ekranlarda (lg+) görünür; dar ekranda yer kaplamasın diye hiç
 * render edilmiyor.
 */

type Scene = "sail" | "battle" | "island" | "sirens" | "arrival";

const SECTION_SCENES: { id: string; scene: Scene }[] = [
  { id: "top", scene: "sail" },
  { id: "about", scene: "sail" },
  { id: "work", scene: "battle" },
  { id: "path", scene: "island" },
  { id: "play", scene: "sirens" },
  { id: "contact", scene: "arrival" },
];

const PALETTE: Record<Scene, [string, string, string]> = {
  // [gökyüzü üstü, ufuk, deniz/dip]
  sail: ["#0e2a4a", "#155a72", "#0c3f4a"],
  battle: ["#0a1420", "#1c2f42", "#0a1418"],
  island: ["#123b3a", "#1f6b57", "#0f2e2a"],
  sirens: ["#2a1f45", "#5b3d78", "#1c2450"],
  arrival: ["#3a1f2e", "#c25f2e", "#e8a54a"],
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

function mixHex(a: string, b: string, t: number) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return `rgb(${lerp(ar, br, t) | 0}, ${lerp(ag, bg, t) | 0}, ${lerp(ab, bb, t) | 0})`;
}

/* -------------------------------------------------------------------------- */
/*  Çizim yardımcıları: düz vektör şekiller, "oyun" hissi için net silüetler   */
/* -------------------------------------------------------------------------- */

function drawWaves(ctx: CanvasRenderingContext2D, w: number, y: number, t: number, amp: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = -4; x <= w + 4; x += 6) {
    const yy = y + Math.sin(x * 0.09 + t) * amp;
    if (x === -4) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
  }
  ctx.stroke();
}

function drawShip(ctx: CanvasRenderingContext2D, cx: number, cy: number, rock: number, ember: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rock * 0.12);

  // gövde
  ctx.fillStyle = "#f4efe6";
  ctx.beginPath();
  ctx.moveTo(-20, 6);
  ctx.lineTo(20, 6);
  ctx.lineTo(13, 15);
  ctx.lineTo(-13, 15);
  ctx.closePath();
  ctx.fill();

  // direk + yelken
  ctx.fillRect(-1.5, -28, 3, 34);
  ctx.beginPath();
  ctx.moveTo(1.5, -26);
  ctx.lineTo(17, -8);
  ctx.lineTo(1.5, -3);
  ctx.closePath();
  ctx.fillStyle = ember;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawFigureWalking(ctx: CanvasRenderingContext2D, cx: number, cy: number, legPhase: number) {
  ctx.fillStyle = "#f4efe6";
  ctx.strokeStyle = "#f4efe6";
  ctx.lineWidth = 2.5;
  // baş
  ctx.beginPath();
  ctx.arc(cx, cy - 16, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // gövde
  ctx.beginPath();
  ctx.moveTo(cx, cy - 11);
  ctx.lineTo(cx, cy + 2);
  ctx.stroke();
  // bacaklar
  const swing = Math.sin(legPhase) * 6;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 2);
  ctx.lineTo(cx + swing, cy + 14);
  ctx.moveTo(cx, cy + 2);
  ctx.lineTo(cx - swing, cy + 14);
  ctx.stroke();
  // kollar
  ctx.beginPath();
  ctx.moveTo(cx, cy - 8);
  ctx.lineTo(cx + 7, cy - 2);
  ctx.moveTo(cx, cy - 8);
  ctx.lineTo(cx - 7, cy - 2);
  ctx.stroke();
}

function drawFigureBound(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // direk
  ctx.strokeStyle = "#f4efe6";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 26);
  ctx.lineTo(cx, cy + 16);
  ctx.stroke();
  // figür, kollar direğe bağlı gibi yana açık
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy - 14, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 9);
  ctx.lineTo(cx, cy + 4);
  ctx.moveTo(cx, cy - 7);
  ctx.lineTo(cx + 9, cy - 10);
  ctx.moveTo(cx, cy - 7);
  ctx.lineTo(cx - 9, cy - 10);
  ctx.moveTo(cx, cy + 4);
  ctx.lineTo(cx + 5, cy + 13);
  ctx.moveTo(cx, cy + 4);
  ctx.lineTo(cx - 5, cy + 13);
  ctx.stroke();
  // ip taraması
  ctx.strokeStyle = "rgba(244,239,230,0.5)";
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 10 + i * 6);
    ctx.lineTo(cx + 6, cy - 12 + i * 6);
    ctx.stroke();
  }
}

function drawSiren(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  ctx.fillStyle = "rgba(244,239,230,0.75)";
  ctx.beginPath();
  ctx.arc(cx, cy + Math.sin(t) * 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy + 2);
  ctx.lineTo(cx + 8, cy + 8 + Math.sin(t) * 2);
  ctx.lineTo(cx - 2, cy + 9);
  ctx.closePath();
  ctx.fill();
}

function drawMonster(ctx: CanvasRenderingContext2D, cx: number, cy: number, pulse: number) {
  const r = 13 + pulse * 1.5;
  ctx.fillStyle = "rgba(10,15,20,0.9)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8853a";
  ctx.beginPath();
  ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawIsland(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = "rgba(20,50,45,0.9)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4a7a5c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 12, cy + 4);
  ctx.lineTo(cx + 15, cy - 12);
  ctx.stroke();
  ctx.fillStyle = "#4a7a5c";
  for (const dx of [-6, 0, 6]) {
    ctx.beginPath();
    ctx.ellipse(cx + 15 + dx * 0.6, cy - 14, 6, 2.5, dx * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGate(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = "rgba(244,239,230,0.85)";
  ctx.fillRect(cx - 10, cy - 2, 20, 16);
  ctx.beginPath();
  ctx.moveTo(cx - 13, cy - 2);
  ctx.lineTo(cx, cy - 16);
  ctx.lineTo(cx + 13, cy - 2);
  ctx.closePath();
  ctx.fill();
}

export default function OdysseyRail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tr } = useApp();
  const [scene, setScene] = useState<Scene>("sail");
  const sceneRef = useRef<Scene>("sail");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let sectionTops: { id: string; scene: Scene; top: number }[] = [];
    let overallProgress = 0;
    let activeScene: Scene = "sail";
    let raf = 0;

    const measure = () => {
      sectionTops = SECTION_SCENES.map((s) => {
        const el = document.getElementById(s.id);
        const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
        return { ...s, top };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measure();
    };

    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      overallProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      const ref = window.scrollY + window.innerHeight * 0.5;
      let current: Scene = "sail";
      for (const s of sectionTops) {
        if (s.top <= ref) current = s.scene;
      }
      activeScene = current;
      if (current !== sceneRef.current) {
        sceneRef.current = current;
        setScene(current);
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      const [sky, horizon, deep] = PALETTE[activeScene];
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, sky);
      grad.addColorStop(0.5, horizon);
      grad.addColorStop(1, deep);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const t = reduced ? 0 : now / 900;

      // ince, tekrarlayan dalga çizgileri: derinlik hissi
      for (let i = 0; i < 6; i++) {
        drawWaves(
          ctx,
          width,
          height * (0.15 + i * 0.15),
          t + i,
          2 + i * 0.4,
          `rgba(244,239,230,${0.05 + i * 0.01})`,
        );
      }

      // karakterin dikey konumu: tüm sayfa ilerlemesine bağlı, tepeden dibe
      const margin = 34;
      const cy = margin + overallProgress * (height - margin * 2);
      const cx = width / 2 + (reduced ? 0 : Math.sin(t * 0.6) * 6);

      switch (activeScene) {
        case "sail":
          drawShip(ctx, cx, cy, reduced ? 0 : Math.sin(t), "#e8853a");
          break;
        case "battle": {
          const shake = reduced ? 0 : Math.sin(t * 6) * 2;
          drawMonster(ctx, cx + 30, cy - 10, reduced ? 0 : Math.sin(t * 2));
          drawShip(ctx, cx + shake, cy, reduced ? 0.4 : Math.sin(t * 3) * 1.4, "#e8853a");
          break;
        }
        case "island":
          drawIsland(ctx, cx + 26, cy + 4);
          drawFigureWalking(ctx, cx, cy, reduced ? 0 : t * 5);
          break;
        case "sirens":
          drawSiren(ctx, cx - 26, cy + 18, t);
          drawSiren(ctx, cx + 28, cy + 10, t + 1.4);
          drawFigureBound(ctx, cx, cy);
          break;
        case "arrival":
          drawGate(ctx, cx + 30, cy);
          drawFigureWalking(ctx, cx, cy, reduced ? 0 : t * 4.2);
          break;
      }

      // sıcak hâle: marka rengiyle küçük bir bağ
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
      glow.addColorStop(0, "rgba(232,133,58,0.16)");
      glow.addColorStop(1, "rgba(232,133,58,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        updateProgress();
        scrollRaf = 0;
        if (reduced) draw(0);
      });
    };

    resize();
    updateProgress();
    draw(0);

    const onResize = () => {
      resize();
      updateProgress();
      // `resize` sets canvas.width/height, which clears it; without this the
      // rail stays blank until the next scroll (or forever under reduced motion).
      draw(performance.now());
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (!reduced) raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const labels: Record<Scene, string> = {
    sail: tr(ui.odyssey.sail),
    battle: tr(ui.odyssey.battle),
    island: tr(ui.odyssey.island),
    sirens: tr(ui.odyssey.sirens),
    arrival: tr(ui.odyssey.arrival),
  };

  return (
    <aside
      aria-hidden
      className="fixed right-0 top-16 z-30 hidden h-[calc(100dvh-4rem)] w-[150px] lg:block"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <span
        key={scene}
        className="intro pointer-events-none absolute inset-x-0 top-3 block text-center text-[10px] uppercase tracking-[0.14em]"
        style={{
          fontFamily: "var(--font-mono)",
          color: "rgba(244,239,230,0.82)",
          textShadow: "0 1px 3px rgba(0,0,0,0.55)",
        }}
      >
        {labels[scene]}
      </span>
    </aside>
  );
}
