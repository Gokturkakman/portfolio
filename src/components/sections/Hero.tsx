"use client";

import Image from "next/image";
import { ArrowDown, Sparkles } from "lucide-react";
import ParticleName from "@/components/ParticleName";
import { Magnetic } from "@/components/motion-primitives";
import { useApp } from "@/lib/app-state";
import { identity, socials, stack, ui } from "@/content/profile";

/**
 * Giriş animasyonu bilerek CSS ile yapılıyor (`.intro` + `--intro-delay`).
 * JS ile yapılsaydı, paket yüklenemediğinde ya da hidrasyon başarısız
 * olduğunda hero 0 opaklıkta takılı kalırdı. `animation-fill-mode: both`
 * sayesinde en kötü senaryoda içerik doğrudan son hâlinde görünür.
 */
const step = (i: number) => ({ "--intro-delay": `${0.15 + i * 0.09}s` }) as React.CSSProperties;

export default function Hero() {
  const { tr, setChatOpen } = useApp();
  const keywords = stack.flatMap((g) => g.items);

  return (
    <section
      id="top"
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden pt-24"
    >
      {/* Zeminde çok kısık bir kor ışığı: düz siyahı kırıyor */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background: "radial-gradient(circle, var(--glow) 0%, transparent 62%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[92rem] px-[var(--gutter)]">
        {/* Üst satır: ünvan + konum */}
        <div
          className="intro mb-8 flex flex-wrap items-center gap-x-4 gap-y-2"
          style={step(0)}
        >
          <span className="text-eyebrow">{tr(identity.role)}</span>
          <span className="h-px w-8 bg-line-strong" />
          <span className="text-eyebrow">{tr(identity.location)}</span>
        </div>

        {/* İsim: parçacıklar */}
        <div className="intro relative" style={step(1)}>
          <ParticleName
            text={identity.name}
            className="h-[22vw] max-h-[15rem] min-h-[5.5rem] w-full"
          />
          <span className="pointer-events-none absolute -bottom-1 right-0 hidden text-[10px] text-fg-faint md:block lg:hidden">
            {tr(ui.hero.hint)}
          </span>
        </div>

        {/* Tanıtım cümlesi + eylemler: isim bittikten SONRA başlıyor, bu yüzden
            portre bu blok içinde nereye konsa isme değme ihtimali sıfır. */}
        <div className="relative lg:min-h-[24rem]">
          <p
            className="intro mt-10 max-w-2xl text-pretty text-lg leading-relaxed text-fg-dim sm:text-xl"
            style={step(2)}
          >
            {tr(identity.tagline)}
          </p>

          <div
            className="intro mt-10 flex flex-wrap items-center gap-3"
            style={step(3)}
          >
            <Magnetic strength={0.24}>
              <a
                href="#work"
                className="group flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition-transform duration-300 hover:scale-[1.03]"
              >
                {tr(ui.hero.cta)}
                <ArrowDown
                  size={15}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </a>
            </Magnetic>

            <Magnetic strength={0.24}>
              <button
                onClick={() => setChatOpen(true)}
                className="ember-glow flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-medium text-fg transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                <Sparkles size={14} strokeWidth={2} />
                {tr(ui.hero.ctaAlt)}
              </button>
            </Magnetic>

            <div className="ml-2 flex items-center gap-4">
              {socials.slice(0, 4).map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[12px] text-fg-faint underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                >
                  {tr(s.label)}
                </a>
              ))}
            </div>
          </div>

          {/* Portre: bu bloğun (isimden sonraki) sağ-alt köşesinde, yatay dikdörtgen */}
          <div
            className="intro surface absolute bottom-0 right-0 hidden w-72 overflow-hidden rounded-3xl shadow-[0_20px_60px_-14px_var(--glow)] lg:block lg:h-40 xl:h-48 xl:w-[26rem]"
            style={step(1)}
          >
            <Image
              src="/portrait.jpg"
              alt={identity.name}
              fill
              sizes="(min-width: 1280px) 26rem, 18rem"
              className="scale-110 object-cover object-[46%_30%]"
              priority
            />
          </div>
        </div>
      </div>

      {/* Alt şerit: kayan anahtar kelimeler + kaydırma işareti */}
      <div className="relative mt-auto pt-20">
        <div
          className="intro flex items-center gap-6 border-t border-line py-4"
          style={step(4)}
        >
          <div className="flex shrink-0 items-center gap-2 pl-[var(--gutter)] text-[11px] text-fg-faint">
            <span className="scroll-hint relative block h-6 w-px overflow-hidden bg-line-strong" />
            {tr(ui.hero.scroll)}
          </div>

          <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
              {[...keywords, ...keywords].map((k, i) => (
                <span
                  key={`${k.en}-${i}`}
                  className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-fg-faint"
                >
                  {tr(k)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
