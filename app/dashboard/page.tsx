"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type Ficha = {
  id: string;
  conteudo: string;
  created_at: string;
};

type DashboardData = {
  totalFichas: number;
  fichasHoje: number;
  totalPalavras: number;
  chartData: [string, number][];
};

/* ─────────────────────────────
   UTILS
──────────────────────────── */

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

const formatarData = (data: string) =>
  dateFormatter.format(new Date(data));

const contarPalavras = (texto = "") =>
  texto.trim().split(/\s+/).filter(Boolean).length;

const truncate = (text = "", size = 120) =>
  text.length > size ? `${text.slice(0, size)}...` : text;

/* ─────────────────────────────
   DATA HOOK
──────────────────────────── */

function useDashboard() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFichas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("fichas")
        .select("id, conteudo, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFichas(data ?? []);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  const dashboardData = useMemo<DashboardData>(() => {
    const hoje = formatarData(new Date().toISOString());

    let totalFichas = 0;
    let fichasHoje = 0;
    let totalPalavras = 0;

    const mapa = new Map<string, number>();

    for (const ficha of fichas) {
      totalFichas++;

      const palavras = contarPalavras(ficha.conteudo);
      totalPalavras += palavras;

      const dia = formatarData(ficha.created_at);

      if (dia === hoje) {
        fichasHoje++;
      }

      mapa.set(dia, (mapa.get(dia) ?? 0) + 1);
    }

    return {
      totalFichas,
      fichasHoje,
      totalPalavras,
      chartData: Array.from(mapa.entries()).slice(-7),
    };
  }, [fichas]);

  return {
    fichas,
    loading,
    error,
    refetch: fetchFichas,
    ...dashboardData,
  };
}

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function Dashboard() {
  const {
    fichas,
    loading,
    error,
    totalFichas,
    fichasHoje,
    totalPalavras,
    chartData,
  } = useDashboard();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        <Header />

        {loading && <Loading />}

        {!loading && error && <Error message={error} />}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card title="Total de Fichas" value={totalFichas} />
              <Card title="Criadas Hoje" value={fichasHoje} />
              <Card title="Palavras Totais" value={totalPalavras} />
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Chart data={chartData} />
              <RecentList fichas={fichas} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ─────────────────────────────
   UI
──────────────────────────── */

const Header = memo(function Header() {
  return (
    <header className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">
        📊 Dashboard
      </h1>

      <p className="text-sm text-zinc-400">
        Visão geral das fichas do sistema
      </p>
    </header>
  );
});

function Loading() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-zinc-400">
      Carregando dashboard...
    </div>
  );
}

function Error({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-300">
      {message}
    </div>
  );
}

const Card = memo(function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition hover:border-white/20">
      <p className="text-sm text-zinc-400">{title}</p>

      <strong className="mt-2 block text-3xl font-bold">
        {value.toLocaleString("pt-BR")}
      </strong>
    </article>
  );
});

const Chart = memo(function Chart({
  data,
}: {
  data: [string, number][];
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="mb-6 text-sm text-zinc-300">
        Fichas dos últimos dias
      </h2>

      <div className="flex h-48 items-end gap-2">
        {data.map(([dia, qtd]) => {
          const height = Math.min(qtd * 18, 160);

          return (
            <div
              key={dia}
              className="flex flex-1 flex-col items-center"
            >
              <div
                className="w-full rounded-lg bg-rose-500/80 transition-all duration-300"
                style={{ height }}
              />

              <span className="mt-2 text-[10px] text-zinc-500">
                {dia.slice(0, 5)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
});

const RecentList = memo(function RecentList({
  fichas,
}: {
  fichas: Ficha[];
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="mb-4 text-sm text-zinc-300">
        Fichas recentes
      </h2>

      <div className="space-y-3">
        {fichas.slice(0, 5).map((ficha) => (
          <article
            key={ficha.id}
            className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300 transition hover:border-white/20"
          >
            {truncate(ficha.conteudo) || "Sem conteúdo"}
          </article>
        ))}
      </div>
    </section>
  );
});
