import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

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
        <ThemeProvider>
        {/* 🌹 Navbar global */}
        <Navbar />

        {/* 📦 Conteúdo */}
        <main className="flex-1 pt-24 px-4 md:px-6">
          {children}
        </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
