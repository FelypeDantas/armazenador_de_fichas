import FormFicha from "@/components/FormFicha";

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function CriarFichaPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-4 sm:px-6 py-10">
      
      <div className="max-w-3xl mx-auto space-y-8">

        <Header />

        <Card>
          <FormFicha />
        </Card>

      </div>
    </main>
  );
}

/* ─────────────────────────────
   SUB COMPONENTS
──────────────────────────── */

function Header() {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        Criar nova ficha
      </h1>

      <p className="text-sm text-zinc-500">
        Preencha as informações abaixo para gerar uma nova ficha.
      </p>
    </header>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="
        relative rounded-2xl p-6 sm:p-8
        bg-white/5 border border-white/10
        backdrop-blur-md
        shadow-lg shadow-black/20
      "
    >
      {/* glow sutil */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-40" />

      <div className="relative">
        {children}
      </div>
    </section>
  );
}
