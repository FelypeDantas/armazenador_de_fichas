"use client";

import { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    closestCenter,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatarParaWhatsApp } from "@/lib/FormatarFicha";
import { supabase } from "@/lib/supabaseClient";

interface Ficha {
    id: string;
    conteudo: string;
    deletado?: boolean | null;
}

type Dia = {
    id: string;
    fichaId: string | null;
};

const GATILHOS_SENSIVEIS = [
    "+18",
    "sexo",
    "sexual",
    "erótico",
    "nsfw",
    "violência",
    "abuso",
];

const uid = () => crypto.randomUUID();

function criarDiasBase(): Dia[] {
    return Array.from({ length: 6 }).map(() => ({
        id: uid(),
        fichaId: null,
    }));
}

function SortableItem({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    );
}

// 🔍 otimizado
function detectarGatilhos(texto: string): string[] {
    const t = texto.toLowerCase();
    return GATILHOS_SENSIVEIS.filter((g) => t.includes(g));
}

export default function GradePage() {
    const [nomeGrade, setNomeGrade] = useState("Vale de Poesias");
    const [dias, setDias] = useState<Dia[]>(criarDiasBase());
    const [fichas, setFichas] = useState<Ficha[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [busca, setBusca] = useState("");
    const [isExtendida, setIsExtendida] = useState(false);
    const [dataInicio, setDataInicio] = useState("");

    // 🚀 FETCH otimizado (sem race condition)
    useEffect(() => {
        let ativo = true;

        async function fetchData() {
            setLoading(true);
            setErro(null);

            const { data, error } = await supabase
                .from("fichas")
                .select("id, conteudo, deletado")
                .not("deletado", "eq", true);

            if (!ativo) return;

            if (error) {
                setErro("Erro ao carregar fichas");
            } else {
                setFichas(data || []);
            }

            setLoading(false);
        }

        fetchData();

        return () => {
            ativo = false;
        };
    }, []);

    // ⚡ MAPA (GRANDE OTIMIZAÇÃO)
    const fichasMap = useMemo(() => {
        const map = new Map<string, Ficha>();
        fichas.forEach(f => map.set(f.id, f));
        return map;
    }, [fichas]);

    // 🔍 filtro
    const fichasFiltradas = useMemo(() => {
        const q = busca.toLowerCase();
        return fichas.filter((f) =>
            f.conteudo.toLowerCase().includes(q)
        );
    }, [busca, fichas]);

    // 🚨 ALERTA MAIS PRECISO
    const alertaGatilhos = useMemo(() => {
        const ocorrencias: { dia: number; gatilhos: string[] }[] = [];

        dias.forEach((dia, index) => {
            const ficha = dia.fichaId ? fichasMap.get(dia.fichaId) : null;
            if (!ficha) return;

            const gatilhos = detectarGatilhos(ficha.conteudo);
            if (gatilhos.length) {
                ocorrencias.push({ dia: index, gatilhos });
            }
        });

        if (ocorrencias.length < 2) return null;

        const todos = ocorrencias.flatMap(o => o.gatilhos);
        const comuns = [...new Set(todos)];

        return `⚠️ Detectado conflito de gatilhos sensíveis entre dias da grade: ${comuns.join(", ")}`;
    }, [dias, fichasMap]);

    function selecionarFicha(diaId: string, fichaId: string) {
        setDias(prev =>
            prev.map(d =>
                d.id === diaId ? { ...d, fichaId: fichaId || null } : d
            )
        );
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setDias((items) => {
            const oldIndex = items.findIndex(i => i.id === active.id);
            const newIndex = items.findIndex(i => i.id === over.id);

            if (oldIndex === -1 || newIndex === -1) return items;

            return arrayMove(items, oldIndex, newIndex);
        });
    }

    function extrairTitulo(conteudo: string) {
        return conteudo.split("\n")[0].replace(/\*/g, "").slice(0, 60);
    }

    function gerarTexto() {
        let texto = `❛ ━━━━━━･❪🌹❫ ･━━━━━━ ❜\n`;
        texto += `🌹🩶 ${nomeGrade} 🩶🌹\n`;
        texto += `📜 Grade Oficial da Semana 📜\n`;
        texto += `❛ ━━━━━━━━━━━━━━━━ ❜\n`;

        dias.forEach((dia, index) => {
            const ficha = dia.fichaId ? fichasMap.get(dia.fichaId) : null;

            texto += `❛ Dia ${index + 1} ❜\n\n`;

            texto += ficha
                ? formatarParaWhatsApp(ficha.conteudo) + "\n"
                : "*(Nenhuma ficha selecionada)*\n";

            texto += "──────────────\n";
        });

        return texto;
    }

    async function copiar() {
        await navigator.clipboard.writeText(gerarTexto());
        alert("Grade copiada 🚀");
    }

    if (loading) {
        return <div className="p-10 text-center text-zinc-400">Carregando...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                <h1 className="text-3xl font-bold text-pink-500">
                    Criador de Grade 🌹
                </h1>

                {alertaGatilhos && (
                    <div className="bg-red-500/10 border border-red-500 text-red-300 p-3 rounded-xl">
                        {alertaGatilhos}
                    </div>
                )}

                <input
                    value={nomeGrade}
                    onChange={(e) => setNomeGrade(e.target.value)}
                    className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
                />

                <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
                />

                <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
                />

                <button
                    onClick={() => setIsExtendida(!isExtendida)}
                    className="bg-purple-600 px-4 py-2 rounded"
                >
                    {isExtendida ? "Desativar grade estendida" : "Ativar grade estendida"}
                </button>

                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={dias.map(d => d.id)} strategy={verticalListSortingStrategy}>
                        {dias.map((dia, index) => (
                            <SortableItem key={dia.id} id={dia.id}>
                                <div className="bg-zinc-900 p-4 rounded-xl mb-3">

                                    {/* 🔥 AQUI VOLTOU A LÓGICA ORIGINAL */}
                                    <div className="text-pink-400 font-semibold">
                                        Dia {index + 1}
                                    </div>

                                    <select
                                        value={dia.fichaId ?? ""}
                                        onChange={(e) =>
                                            selecionarFicha(dia.id, e.target.value)
                                        }
                                        className="w-full mt-2 p-2 bg-zinc-800 rounded"
                                    >
                                        <option value="">Selecionar ficha</option>
                                        {fichasFiltradas.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {extrairTitulo(f.conteudo)}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            </SortableItem>
                        ))}
                    </SortableContext>
                </DndContext>

                <button
                    onClick={copiar}
                    className="w-full bg-pink-600 p-4 rounded-xl font-bold"
                >
                    Copiar Grade 📋
                </button>

            </div>
        </div>
    );
}
