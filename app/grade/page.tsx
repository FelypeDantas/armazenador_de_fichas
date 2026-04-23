"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { formatarParaWhatsApp } from "@/lib/FormatarFicha";

// 🔌 Supabase (seguro)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🧾 Estrutura REAL do banco
interface Ficha {
    id: string; // uuid
    conteudo: string; // texto completo
    deletado?: boolean | null;
}

type Selecoes = Record<string, string | null>;

const diasBase: string[] = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Obra extra",
];

export default function GradePage() {
    const [nomeGrade, setNomeGrade] = useState<string>("Vale de Poesias");
    const [dias, setDias] = useState<string[]>(diasBase);
    const [selecoes, setSelecoes] = useState<Selecoes>({});
    const [fichas, setFichas] = useState<Ficha[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);
    const [busca, setBusca] = useState("");

    // 🚀 Buscar fichas corretamente
    useEffect(() => {
        async function fetchFichas() {
            setLoading(true);
            setErro(null);

            const { data, error } = await supabase
                .from("fichas")
                .select("id, conteudo, deletado")
                .not("deletado", "eq", true); // evita problema com null

            if (error) {
                console.error(error);
                setErro(error.message);
                setLoading(false);
                return;
            }

            setFichas(data || []);
            setLoading(false);
        }

        fetchFichas();
    }, []);

    // 🔍 Busca dentro do conteúdo
    const fichasFiltradas = useMemo(() => {
        return fichas.filter((f) =>
            f.conteudo.toLowerCase().includes(busca.toLowerCase())
        );
    }, [busca, fichas]);

    function selecionarFicha(dia: string, fichaId: string) {
        setSelecoes((prev) => ({
            ...prev,
            [dia]: fichaId || null, // 🔥 corrigido (era number antes)
        }));
    }

    function moverDia(index: number, direcao: number) {
        const novo = [...dias];
        const destino = index + direcao;

        if (destino < 0 || destino >= dias.length) return;

        [novo[index], novo[destino]] = [novo[destino], novo[index]];
        setDias(novo);
    }

    // 🧠 Pega primeira linha da ficha pra exibir no select
    function extrairTitulo(conteudo: string) {
        const linha = conteudo.split("\n")[0];
        return linha.replace(/\*/g, "").slice(0, 60) || "Ficha";
    }

    function gerarTexto(): string {
        let texto = `❛ ━━━━━━･❪🌹❫ ･━━━━━━ ❜\n`;
        texto += `🌹🩶 ${nomeGrade} 🩶🌹\n`;
        texto += `📜 Grade Oficial da Semana 📜\n`;
        texto += `❛ ━━━━━━━━━━━━━━━━ ❜\n`;

        dias.forEach((dia) => {
            const ficha = fichas.find((f) => f.id === selecoes[dia]);

            texto += `\n❛ ${dia} ❜\n\n`;

            if (ficha) {
                texto += formatarParaWhatsApp(ficha.conteudo) + "\n"; // 🔥 usa conteúdo direto
                texto += "◃───────────────────────────────▹\n";
            } else {
                texto += `*(Nenhuma ficha selecionada)*\n`;
                texto += `◃───────────────────────────────▹\n`;
            }
        });

        return texto;
    }

    async function copiar() {
        try {
            await navigator.clipboard.writeText(gerarTexto());
            alert("Grade copiada 🚀");
        } catch {
            alert("Erro ao copiar 😢");
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">
                    Criador de Grade 🌹
                </h1>

                <input
                    value={nomeGrade}
                    onChange={(e) => setNomeGrade(e.target.value)}
                    className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-sm sm:text-base"
                    placeholder="Nome da grade"
                />

                {/* 🔍 Busca */}
                <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar ficha..."
                    className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-sm sm:text-base"
                />

                {loading && <p className="text-zinc-400">Carregando fichas...</p>}
                {erro && <p className="text-red-500">Erro: {erro}</p>}

                {!loading && fichas.length === 0 && (
                    <p className="text-yellow-500">Nenhuma ficha encontrada 👀</p>
                )}

                <div className="grid gap-4">
                    {dias.map((dia, index) => (
                        <div
                            key={dia}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 bg-zinc-900 p-4 rounded-xl shadow"
                        >
                            {/* Dia */}
                            <div className="w-full sm:w-28 font-semibold text-pink-400">
                                {dia}
                            </div>

                            {/* Select */}
                            <select
                                className="w-full flex-1 p-2 bg-zinc-800 rounded text-sm sm:text-base"
                                disabled={loading}
                                value={selecoes[dia] ?? ""}
                                onChange={(e) => selecionarFicha(dia, e.target.value)}
                            >
                                <option value="">Selecionar ficha</option>
                                {fichasFiltradas.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {extrairTitulo(f.conteudo)}
                                    </option>
                                ))}
                            </select>

                            {/* Botões */}
                            <div className="flex gap-2 justify-end sm:justify-center">
                                <button
                                    onClick={() => moverDia(index, -1)}
                                    className="px-3 py-1 bg-zinc-700 rounded hover:bg-zinc-600 transition"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => moverDia(index, 1)}
                                    className="px-3 py-1 bg-zinc-700 rounded hover:bg-zinc-600 transition"
                                >
                                    ↓
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={copiar}
                    className="w-full bg-pink-600 hover:bg-pink-700 p-4 rounded-xl font-bold text-base sm:text-lg transition"
                >
                    Copiar Grade 📋
                </button>
            </div>
        </div>
    );
}
