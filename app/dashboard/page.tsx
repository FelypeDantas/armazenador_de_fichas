"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Ficha = {
  id: string;
  conteudo: string;
  created_at: string;
};

// 🧠 UTILS (mais seguros)
const contarPalavras = (texto: string) =>
  texto ? texto.trim().split(/\s+/).filter(Boolean).length : 0;

const formatarDia = (data: string) =>
  new Date(data).toLocaleDateString("pt-BR");

export default function Dashboard() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 FETCH ROBUSTO
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("fichas")
          .select("id, conteudo, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!active) return;
        setFichas(data || []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar fichas");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  // 📊 MÉTRICAS OTIMIZADAS
  const metrics = useMemo(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");

    return fichas.reduce(
      (acc, f) => {
        acc.totalFichas++;
        acc.totalPalavras += contarPalavras(f.conteudo);

        if (formatarDia(f.created_at) === hoje) {
          acc.fichasHoje++;
        }

        return acc;
      },
      {
        totalFichas: 0,
        fichasHoje: 0,
        totalPalavras: 0,
      }
    );
  }, [fichas]);

  // 📈 GRÁFICO (últimos 7 dias mais consistente)
  const fichasPorDia = useMemo(() => {
    const mapa = new Map<string, number>();

    fichas.forEach((f) => {
      const dia = formatarDia(f.created_at);
      mapa.set(dia, (mapa.get(dia) || 0) + 1);
    });

    return Array.from(mapa.entries()).slice(-7);
  }, [fichas]);

  // 🌀 LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Carregando dashboard...
      </div>
    );
  }

  // ❌ ERRO
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>
        <p className="text-zinc-400 text-sm">
          Visão geral das fichas do sistema
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total de Fichas" value={metrics.totalFichas} />
        <Card title="Criadas Hoje" value={metrics.fichasHoje} />
        <Card title="Palavras Totais" value={metrics.totalPalavras} />
      </div>

      {/* GRÁFICO */}
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

      {/* LISTA */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm text-zinc-300 mb-4">
          Fichas recentes
        </h2>

        <div className="space-y-3 max-h-80 overflow-auto pr-1">
          {fichas.slice(0, 5).map((f) => (
            <div
              key={f.id}
              className="p-3 rounded-xl bg-black/40 border border-white/10 text-sm text-zinc-300 hover:border-white/20 transition"
            >
              {f.conteudo?.slice(0, 120) || "Sem conteúdo"}
              {f.conteudo?.length > 120 ? "..." : ""}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// 🧱 CARD MODERNO
function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:scale-[1.02] transition">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
