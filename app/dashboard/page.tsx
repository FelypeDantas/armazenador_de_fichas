"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type DashboardStats = {
  arcanjos: number;
  admFixos: number;
  adms: number;
};

type FichaTitulo = {
  titulo: string | null;
};

const TITULOS_ARCANJOS = new Set([
  "Arcanjo Vermelho",
  "Arcanjo Negro",
  "Arcanjo Branco",
  "Arcanjo Dourado",
  "Arcanjo Carmesim",
]);

const INITIAL_STATS: DashboardStats = {
  arcanjos: 0,
  admFixos: 0,
  adms: 0,
};

const CARDS = [
  {
    key: "arcanjos",
    title: "Arcanjos",
    icon: "👼",
    description: "Vermelho, Negro, Branco, Dourado e Carmesim",
  },
  {
    key: "admFixos",
    title: "ADM de Fixo",
    icon: "🛡️",
    description: "Responsáveis fixos",
  },
  {
    key: "adms",
    title: "ADM",
    icon: "⚔️",
    description: "Administradores",
  },
] as const;

function useDashboard() {
  const [stats, setStats] =
    useState<DashboardStats>(INITIAL_STATS);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } =
          await supabase
            .from("fichas")
            .select(`
              id,
              titulos (
                titulo
              )
            `);

        if (error) throw error;

        const nextStats: DashboardStats = {
          arcanjos: 0,
          admFixos: 0,
          adms: 0,
        };

        for (const ficha of (data ??
          []) as FichaDashboard[]) {

          const titulo =
            ficha.titulos?.titulo?.trim();

          if (!titulo) continue;

          if (
            TITULOS_ARCANJOS.has(titulo)
          ) {
            nextStats.arcanjos++;
            continue;
          }

          switch (titulo) {
            case "ADM":
              nextStats.adms++;
              break;

            case "ADM de Fixo":
              nextStats.admFixos++;
              break;
          }
        }

        setStats(nextStats);

      } catch (err) {
        console.error(
          "[DASHBOARD_ERROR]",
          err
        );

        setError(
          "Não foi possível carregar os dados do dashboard."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    stats,
    loading,
    error,
    reload: loadDashboard,
  };
}
export default function Dashboard() {
  const { stats, loading, error } =
    useDashboard();

  const totalEquipe =
    stats.arcanjos +
    stats.admFixos +
    stats.adms;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <Header />

        {loading && <Loading />}

        {!loading && error && (
          <Error message={error} />
        )}

        {!loading && !error && (
          <div className="space-y-6">

            <section className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent p-8">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                Equipe Principal
              </p>

              <h2 className="mt-3 text-6xl font-black">
                {totalEquipe.toLocaleString("pt-BR")}
              </h2>

              <p className="mt-2 text-zinc-400">
                Arcanjos, ADMs e ADMs de Fixo
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {CARDS.map((card) => (
                <StatCard
                  key={card.key}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  value={stats[card.key]}
                />
              ))}
            </section>

          </div>
        )}
      </div>
    </main>
  );
}

const Header = memo(function Header() {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold">
        📊 Dashboard
      </h1>

      <p className="mt-2 text-zinc-400">
        Visão geral da equipe
      </p>
    </header>
  );
});

function Loading() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
      Carregando estatísticas...
    </div>
  );
}

function Error({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-300">
      {message}
    </div>
  );
}

const StatCard = memo(function StatCard({
  icon,
  title,
  description,
  value,
}: {
  icon: string;
  title: string;
  description: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/30 hover:bg-white/[0.05]">
      <div className="text-4xl">
        {icon}
      </div>

      <p className="mt-4 text-sm font-medium">
        {title}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>

      <strong className="mt-4 block text-4xl font-bold">
        {value.toLocaleString("pt-BR")}
      </strong>
    </article>
  );
});
