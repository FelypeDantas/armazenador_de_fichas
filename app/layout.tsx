import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

/* ─────────────────────────────
   FONTS
──────────────────────────── */

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ─────────────────────────────
   METADATA
──────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: "Dark Roses 🌹",
    template: "%s | Dark Roses",
  },
  description:
    "Sistema para troca de leituras e gerenciamento de fichas. Descubra histórias, compartilhe experiências e registre sua jornada literária.",
  keywords: [
    "livros",
    "leitura",
    "clube do livro",
    "fichas",
    "leitura compartilhada",
  ],
  authors: [{ name: "Dark Roses" }],
  creator: "Dark Roses",

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "Dark Roses 🌹",
    description:
      "Compartilhe leituras, registre experiências e explore histórias.",
    type: "website",
    locale: "pt_BR",
  },
};

/* 🌐 viewport separado (Next 13+) */
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark light",
};

/* ─────────────────────────────
   LAYOUT
──────────────────────────── */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)] font-sans antialiased transition-colors duration-300">

        <ThemeProvider>
          {/* 🌹 Estrutura global */}
          <div className="flex min-h-screen flex-col">

            {/* NAVBAR */}
            <Navbar />

            {/* CONTEÚDO */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24">
              {children}
            </main>

          </div>
        </ThemeProvider>

      </body>
    </html>
  );
}
