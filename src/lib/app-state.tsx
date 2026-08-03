"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Lang, Localized } from "@/content/profile";

type Theme = "dark" | "light";

type AppState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  /** Localized nesnesini aktif dile çözer */
  tr: (v: Localized) => string;

  theme: Theme;
  toggleTheme: () => void;

  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;

  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;

  /** İlk hidrasyon tamamlandı mı — sunucu/istemci farkı olan yerler için */
  mounted: boolean;
};

const Ctx = createContext<AppState | null>(null);

const LANG_KEY = "ga:lang";
const THEME_KEY = "ga:theme";

/* --------------------------------------------------------------------------
   Tercihler React'in dışında yaşıyor: dil `localStorage`'da, tema doğrudan
   <html data-theme> üstünde (layout'taki bootstrap script'i React'ten önce
   yazıyor). İkisini de `useSyncExternalStore` ile okuyoruz — effect içinde
   setState çağırmadan, sunucu anlık görüntüsü ayrı verilerek.
   -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Başka bir sekmede değiştirilirse burada da güncellensin
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "tr" || stored === "en") return stored;
  } catch {
    /* private mode */
  }
  return navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en";
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Sunucuda: Türkçe + koyu. İstemcide gerçek tercih okunur.
  const lang = useSyncExternalStore(subscribe, readLang, () => "tr" as Lang);
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const [chatOpen, setChatOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* private mode */
    }
    document.documentElement.lang = next;
    emit();
  }, []);

  const toggleLang = useCallback(() => {
    setLang(readLang() === "tr" ? "en" : "tr");
  }, [setLang]);

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode */
    }
    emit();
  }, []);

  const tr = useCallback((v: Localized) => v[lang], [lang]);

  // <html lang> ekran okuyucular ve tarayıcı çevirisi için doğru kalsın
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Global kısayollar: ⌘K palet, ⌘J sohbet, Esc kapat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (meta && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setChatOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Palet açıkken arka planın kaymasını engelle
  useEffect(() => {
    if (!paletteOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [paletteOpen]);

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      toggleLang,
      tr,
      theme,
      toggleTheme,
      chatOpen,
      setChatOpen,
      paletteOpen,
      setPaletteOpen,
      mounted,
    }),
    [
      lang,
      setLang,
      toggleLang,
      tr,
      theme,
      toggleTheme,
      chatOpen,
      paletteOpen,
      mounted,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
