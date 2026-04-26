"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Ficha = {
  id: string;
  conteudo: string;
  created_at: string;
};

// 🧠 UTILS
function contarPalavras(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

function formatarDia(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export default function Dashboard() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 FETCH DIRETO NO EFFECT (sem erro de hooks)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("fichas")
        .select("id, conteudo, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Erro ao carregar fichas");
      } else {
        setFichas(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // 📊 MÉTRICAS
  const metrics = useMemo(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");

    let totalPalavras = 0;
    let fichasHoje = 0;

    for (const f of fichas) {
      totalPalavras += contarPalavras(f.conteudo);

      if (formatarDia(f.created_at) === hoje) {
        fichasHoje++;
      }
    }

    return {
      totalFichas: fichas.length,
      fichasHoje,
      totalPalavras,
    };
  }, [fichas]);

  // 📈 GRÁFICO
  const fichasPorDia = useMemo(() => {
    const mapa: Record<string, number> = {};

    fichas.forEach((f) => {
      const dia = formatarDia(f.created_at);
      mapa[dia] = (mapa[dia] || 0) + 1;
    });

    return Object.entries(mapa).slice(-7);
  }, [fichas]);

  // 🌀 LOADING
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400">
        Carregando dashboard...
      </div>
    );
  }

  // ❌ ERRO
  if (error) {
    return (
      <div className="p-10 text-center text-red-400">
        {error}
      </div>
    );
  }

  // 🎯 UI
  return (
    <div className="p-6 space-y-6">
      {/* 🔢 MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total de Fichas" value={metrics.totalFichas} />
        <Card title="Criadas Hoje" value={metrics.fichasHoje} />
        <Card title="Palavras Totais" value={metrics.totalPalavras} />
      </div>

      {/* 📈 GRÁFICO */}
      <div className="bg-zinc-900 rounded-2xl p-4 shadow">
        <h2 className="text-lg mb-4 text-gray-300">
          Fichas nos últimos dias
        </h2>

        <div className="flex items-end gap-2 h-40">
          {fichasPorDia.map(([dia, qtd]) => (
            <div key={dia} className="flex-1 flex flex-col items-center">
              <div
                className="bg-purple-500 w-full rounded-t-md transition-all duration-300"
                style={{ height: `${qtd * 20}px` }}
              />
              <span className="text-xs text-gray-400 mt-1">
                {dia.slice(0, 5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 📄 LISTA RECENTE */}
      <div className="bg-zinc-900 rounded-2xl p-4 shadow">
        <h2 className="text-lg mb-4 text-gray-300">
          Fichas recentes
        </h2>

        <div className="space-y-3 max-h-80 overflow-auto">
          {fichas.slice(0, 5).map((f) => (
            <div
              key={f.id}
              className="p-3 bg-zinc-800 rounded-lg text-sm text-gray-300"
            >
              {f.conteudo.slice(0, 100) || "Sem conteúdo"}...
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 🧱 CARD
function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow hover:scale-[1.02] transition">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}
