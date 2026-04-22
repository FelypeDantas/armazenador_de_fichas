import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Home } from "lucide-react";

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

export const metadata: Metadata = {
  title: "Dark Roses 🌹 | Clube de Leituras",
  description:
    "Dark Roses é um sistema para troca de leituras e gerenciamento de fichas de membros. Descubra histórias, compartilhe experiências e registre sua jornada literária.",
  keywords: ["livros", "leitura", "clube do livro", "fichas de membro"],
  authors: [{ name: "Dark Roses" }],
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white antialiased font-sans transition-colors duration-500">

        {/* 🌙 Theme toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* 🏠 Home button */}
        <div className="fixed top-4 left-4 z-50">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-black/50 backdrop-blur hover:scale-105 transition"
          >
            <Home size={18} />
            <span className="text-sm">Home</span>
          </Link>
        </div>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}