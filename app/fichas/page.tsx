import FormFicha from "@/components/FormFicha";

export default function CriarFichaPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        
        <h1 className="text-3xl font-bold mb-2">
          Criar nova ficha
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Preencha as informações abaixo para gerar uma nova ficha.
        </p>

        <FormFicha />

      </div>
    </main>
  );
}