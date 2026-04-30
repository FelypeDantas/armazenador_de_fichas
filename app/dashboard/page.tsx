"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type Ficha = {
  id: string;
  conteudo: string;
  created_at: string;
};

/* ─────────────────────────────
   UTILS
──────────────────────────── */

const contarPalavras = (texto = "") =>
  texto.trim().split(/\s+/).filter(Boolean).length;

const formatarData = (data: string) =>
  new Date(data).toLocaleDateString("pt-BR");

/* ─────────────────────────────
   HOOK (DATA)
──────────────────────────── */

function useFichas() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFichas = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("fichas")
        .select("id, conteudo, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFichas(data ?? []);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar fichas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  return { fichas, loading, error, refetch: fetchFichas };
}

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function Dashboard() {
  const { fichas, loading, error } = useFichas();

  /* ─────────────────────────────
     METRICS
  ───────────────────────────── */

  const metrics = useMemo(() => {
    const hoje = formatarData(new Date().toISOString());

    return fichas.reduce(
      (acc, ficha) => {
        const palavras = contarPalavras(ficha.conteudo);
        const dia = formatarData(ficha.created_at);

        acc.totalFichas++;
        acc.totalPalavras += palavras;
        if (dia === hoje) acc.fichasHoje++;

        return acc;
      },
      {
        totalFichas: 0,
        fichasHoje: 0,
        totalPalavras: 0,
      }
    );
  }, [fichas]);

  /* ─────────────────────────────
     CHART DATA
  ───────────────────────────── */

  const fichasPorDia = useMemo(() => {
    const mapa = new Map<string, number>();

    fichas.forEach((f) => {
      const dia = formatarData(f.created_at);
      mapa.set(dia, (mapa.get(dia) ?? 0) + 1);
    });

    return Array.from(mapa.entries()).slice(-7);
  }, [fichas]);

  /* ─────────────────────────────
     STATES
  ───────────────────────────── */

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  /* ─────────────────────────────
     RENDER
  ───────────────────────────── */

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 space-y-8">

      <Header />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total de Fichas" value={metrics.totalFichas} />
        <Card title="Criadas Hoje" value={metrics.fichasHoje} />
        <Card title="Palavras Totais" value={metrics.totalPalavras} />
      </section>

      <Chart data={fichasPorDia} />

      <RecentList fichas={fichas} />

    </div>
  );
}

/* ─────────────────────────────
   SUB COMPONENTS
──────────────────────────── */

function Header() {
  return (
    <header>
      <h1 className="text-3xl font-bold">📊 Dashboard</h1>
      <p className="text-zinc-400 text-sm">
        Visão geral das fichas do sistema
      </p>
    </header>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-zinc-400">
      Carregando dashboard...
    </div>
  );
}

function Error({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-red-400">
      {message}
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:scale-[1.02] transition">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Chart({ data }: { data: [string, number][] }) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h2 className="text-sm text-zinc-300 mb-4">
        Fichas dos últimos dias
      </h2>

      <div className="flex items-end gap-2 h-40">
        {data.map(([dia, qtd]) => {
          const height = Math.min(qtd * 18, 140);

          return (
            <div key={dia} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-rose-500/80 rounded-md transition-all"
                style={{ height }}
              />
              <span className="text-[10px] text-zinc-400 mt-1">
                {dia.slice(0, 5)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentList({ fichas }: { fichas: Ficha[] }) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h2 className="text-sm text-zinc-300 mb-4">Fichas recentes</h2>

      <div className="space-y-3 max-h-80 overflow-auto pr-1">
        {fichas.slice(0, 5).map((f) => (
          <div
            key={f.id}
            className="p-3 rounded-xl bg-black/40 border border-white/10 text-sm text-zinc-300 hover:border-white/20 transition"
          >
            {f.conteudo?.slice(0, 120) ?? "Sem conteúdo"}
            {f.conteudo && f.conteudo.length > 120 ? "..." : ""}
          </div>
        ))}
      </div>
    </section>
  );
}
