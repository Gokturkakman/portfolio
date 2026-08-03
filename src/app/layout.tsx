import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-state";
import { identity } from "@/content/profile";

const sans = Geist({
  variable: "--font-sans-var",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
  display: "swap",
});

const display = Instrument_Serif({
  variable: "--font-display-var",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const title = `${identity.name} — ${identity.role.en}`;
const description = identity.tagline.en;

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s · ${identity.name}`,
  },
  description,
  applicationName: identity.name,
  authors: [{ name: identity.name }],
  creator: identity.name,
  openGraph: { type: "website", title, description, siteName: identity.name },
  twitter: { card: "summary_large_image", title, description },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080807" },
    { media: "(prefers-color-scheme: light)", color: "#f6f2ea" },
  ],
};

/**
 * Tema, React devreye girmeden önce <html> üstüne yazılır.
 * Aksi halde sayfa bir kare yanlış temada yanıp söner.
 */
const themeBootstrap = `
(function(){
  try {
    var stored = localStorage.getItem("ga:theme");
    var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    document.documentElement.dataset.theme = stored || (prefersLight ? "light" : "dark");
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      data-theme="dark"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${display.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-dvh">
        <AppProvider>{children}</AppProvider>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
