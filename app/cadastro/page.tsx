import FormFicha from "@/components/FormFicha";

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function CriarFichaPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-4 sm:px-6 py-10">
      
      <section className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">
            Criar nova ficha
          </h1>

          <p className="text-sm text-zinc-500">
            Preencha as informações abaixo para gerar uma nova ficha.
          </p>
        </header>

        {/* FORM */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <FormFicha />
        </div>

      </section>
    </main>
  );
}
