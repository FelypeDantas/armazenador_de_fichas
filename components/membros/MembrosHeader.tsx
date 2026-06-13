"use client";

type Props = {
  title: string;
  subtitle: string;
  search: string;
  onSearchChange: (value: string) => void;
  tipo?: "vermelhas" | "brancas";
};

export default function MembrosHeader({
  search,
  onSearchChange,
  title,
  subtitle,
  tipo,
}: Props) {
  const config = {
    vermelhas: {
      titulo: "🌹 Rosas Vermelhas",
      descricao: "Membros maiores de 18 anos",
    },

    brancas: {
      titulo: "🤍 Rosas Brancas",
      descricao: "Membros menores de 18 anos",
    },
  };

  const dados =
    tipo && config[tipo]
      ? config[tipo]
      : {
          titulo: "Membros cadastrados",
          descricao: "Arquivo vivo de todas as fichas enviadas",
        };

  return (
    <header className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold">
        {dados.titulo}
      </h1>

      <p className="text-xs sm:text-sm text-zinc-500 mt-1">
        {dados.descricao}
      </p>

      <input
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        placeholder="Buscar dentro das fichas..."
        className="
          mt-4
          w-full
          sm:w-2/3
          lg:w-1/2
          px-4
          py-2
          rounded-xl
          border
          border-zinc-300
          dark:border-zinc-700
          bg-transparent
          focus:outline-none
          focus:ring-2
          focus:ring-[var(--primary)]
        "
      />
    </header>
  );
}