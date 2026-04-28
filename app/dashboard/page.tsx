"use client";

import { useEffect, useMemo, useState } from "react";
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

const contarPalavras = (texto: string = "") =>
  texto.trim().split(/\s+/).filter(Boolean).length;

const formatarData = (data: string) =>
  new Date(data).toLocaleDateString("pt-BR");

/* ─────────────────────────────
   COMPONENT
──────────────────────────── */

export default function Dashboard() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─────────────────────────────
     FETCH
  ───────────────────────────── */

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("fichas")
          .select("id, conteudo, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (alive) setFichas(data ?? []);
      } catch (e) {
        console.error(e);
        if (alive) setError("Erro ao carregar fichas");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  /* ─────────────────────────────
     METRICS
  ───────────────────────────── */

  const metrics = useMemo(() => {
    const hoje = formatarData(new Date().toISOString());

    return fichas.reduce(
      (acc, ficha) => {
        const palavras = contarPalavras(ficha.conteudo);
        const dia = formatarData(ficha.created_at);

        acc.totalFichas += 1;
        acc.totalPalavras += palavras;

        if (dia === hoje) acc.fichasHoje += 1;

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

    for (const f of fichas) {
      const dia = formatarData(f.created_at);
      mapa.set(dia, (mapa.get(dia) ?? 0) + 1);
    }

    return Array.from(mapa.entries()).slice(-7);
  }, [fichas]);

  /* ─────────────────────────────
     STATES
  ───────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Carregando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  /* ─────────────────────────────
     RENDER
  ───────────────────────────── */

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 space-y-8">

      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>
        <p className="text-zinc-400 text-sm">
          Visão geral das fichas do sistema
        </p>
      </header>

      {/* CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total de Fichas" value={metrics.totalFichas} />
        <Card title="Criadas Hoje" value={metrics.fichasHoje} />
        <Card title="Palavras Totais" value={metrics.totalPalavras} />
      </section>

      {/* CHART */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm text-zinc-300 mb-4">
          Fichas dos últimos dias
        </h2>

        <div className="flex items-end gap-2 h-40">
          {fichasPorDia.map(([dia, qtd]) => {
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

      {/* LIST */}
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
    </div>
  );
}

/* ─────────────────────────────
   CARD COMPONENT
──────────────────────────── */

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:scale-[1.02] transition">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
