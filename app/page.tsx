"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const animation = {
  container: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  },
};

const FEATURES = [
  {
    title: "📚 Troca de leituras",
    desc: "Compartilhe livros, descubra novas histórias e mergulhe em universos que você ainda não conhece.",
  },
  {
    title: "📝 Fichas de membro",
    desc: "Cada leitor possui uma identidade: gostos, gêneros favoritos e histórico literário.",
  },
  {
    title: "🌙 Comunidade",
    desc: "Um espaço íntimo para quem encontra refúgio e intensidade nas palavras.",
  },
];

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <main className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] overflow-hidden flex flex-col items-center justify-center px-6">

      {/* Glow ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[var(--primary)]/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-[var(--primary-strong)]/20 blur-[120px] rounded-full" />
      </div>

      {/* Hero */}
      <motion.section
        variants={animation.container}
        initial="hidden"
        animate="show"
        className="relative text-center max-w-2xl z-10"
      >
        <motion.h1
          variants={animation.item}
          className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-strong)] bg-clip-text text-transparent"
        >
          🌹 Dark Roses
        </motion.h1>

        <motion.p
          variants={animation.item}
          className="text-lg text-[var(--fg)]/70 mb-8 leading-relaxed"
        >
          Um jardim secreto onde histórias circulam como cartas proibidas,
          leitores deixam rastros e cada ficha guarda um pedaço de alma literária.
        </motion.p>

        <motion.div
          variants={animation.item}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            href="/cadastro"
            className="px-6 py-3 rounded-2xl font-semibold border border-[var(--border)] hover:bg-[var(--muted)] transition backdrop-blur"
          >
            Criar ficha
          </Link>

          <Link
            href="/membros"
            className="px-6 py-3 rounded-2xl font-semibold border border-[var(--border)] hover:bg-[var(--muted)] transition backdrop-blur"
          >
            Ver membros
          </Link>
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section
        variants={animation.container}
        initial="hidden"
        animate="show"
        className="relative mt-24 max-w-5xl grid md:grid-cols-3 gap-6 z-10"
      >
        {FEATURES.map((feature, i) => (
          <motion.article
            key={i}
            variants={animation.item}
            className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl hover:scale-[1.03] transition shadow-sm"
          >
            <h3 className="text-xl font-semibold mb-2">
              {feature.title}
            </h3>
            <p className="text-[var(--fg)]/70">
              {feature.desc}
            </p>
          </motion.article>
        ))}
      </motion.section>

      {/* Footer */}
      <footer className="relative mt-24 text-[var(--fg)]/50 text-sm z-10">
        © {year} Dark Roses • Feito para leitores intensos
      </footer>
    </main>
  );
}
