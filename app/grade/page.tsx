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

// 🧾 Tipos
interface Ficha {
    id: string;
    conteudo: string;
    deletado?: boolean | null;
}

type Dia = {
    id: string;
    fichaId: string | null;
};

// 🧠 helpers
const uid = () => crypto.randomUUID();

function criarDiasBase(): Dia[] {
    return Array.from({ length: 6 }).map(() => ({
        id: uid(),
        fichaId: null,
    }));
}

const nomesSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// 🧱 item arrastável
function SortableItem({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
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

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setErro(null);

            try {
                const { data, error } = await supabase
                    .from("fichas")
                    .select("id, conteudo, deletado")
                    .not("deletado", "eq", true);

                if (error) throw error;

                setFichas(data || []);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setErro(err.message);
                } else {
                    setErro("Erro inesperado ao carregar fichas");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // 🔍 filtro
    const fichasFiltradas = useMemo(() => {
        return fichas.filter((f) =>
            f.conteudo.toLowerCase().includes(busca.toLowerCase())
        );
    }, [busca, fichas]);

    // 🧠 data segura
    function getDataBase(): Date {
        if (!dataInicio) return new Date();

        const d = new Date(dataInicio);
        return isNaN(d.getTime()) ? new Date() : d;
    }

    // 🧠 nome dia
    function getNomeDia(index: number) {
        if (index === dias.length - 1) return "Obra extra";

        const data = getDataBase();
        data.setDate(data.getDate() + index);

        return `${nomesSemana[data.getDay()]} (${data.toLocaleDateString("pt-BR")})`;
    }

    function selecionarFicha(diaId: string, fichaId: string) {
        setDias((prev) =>
            prev.map((d) =>
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

            const lastIndex = items.length - 1;

            if (oldIndex === lastIndex || newIndex === lastIndex) {
                return items;
            }

            return arrayMove(items, oldIndex, newIndex);
        });
    }

    function gerarGradeEstendida(total: number) {
        const lista: Dia[] = [];
        const data = getDataBase();

        while (lista.length < total) {
            const diaSemana = data.getDay();

            if (diaSemana !== 0 && diaSemana !== 6) {
                lista.push({ id: uid(), fichaId: null });
            }

            data.setDate(data.getDate() + 1);
        }

        lista.push({ id: uid(), fichaId: null });
        return lista;
    }

    function toggleExtendida() {
        setDias(() => {
            if (isExtendida) {
                setIsExtendida(false);
                return criarDiasBase();
            } else {
                setIsExtendida(true);
                return gerarGradeEstendida(10);
            }
        });
    }

    function extrairTitulo(conteudo: string) {
        return conteudo.split("\n")[0].replace(/\*/g, "").slice(0, 60);
    }

    // 🔄 botão de retry separado (SEM conflito)
    async function refetch() {
        setLoading(true);
        setErro(null);

        try {
            const { data, error } = await supabase
                .from("fichas")
                .select("id, conteudo, deletado")
                .not("deletado", "eq", true);

            if (error) throw error;

            setFichas(data || []);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErro(err.message);
            } else {
                setErro("Erro inesperado ao carregar fichas");
            }
        } finally {
            setLoading(false);
        }
    }

    function gerarTexto() {
        let texto = `❛ ━━━━━━･❪🌹❫ ･━━━━━━ ❜\n`;
        texto += `🌹🩶 ${nomeGrade} 🩶🌹\n`;
        texto += `📜 Grade Oficial da Semana 📜\n`;
        texto += `❛ ━━━━━━━━━━━━━━━━ ❜\n`;

        dias.forEach((dia, index) => {
            const ficha = fichas.find((f) => f.id === dia.fichaId);

            texto += `❛ ${getNomeDia(index)} ❜\n\n`;

            if (ficha) {
                texto += formatarParaWhatsApp(ficha.conteudo) + "\n";
            } else {
                texto += "*(Nenhuma ficha selecionada)*\n";
            }

            texto += "──────────────\n";
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

                <h1 className="text-3xl font-bold text-pink-500">
                    Criador de Grade 🌹
                </h1>

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
                    placeholder="Buscar ficha..."
                    className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
                />

                <button
                    onClick={toggleExtendida}
                    className="bg-purple-600 px-4 py-2 rounded"
                >
                    {isExtendida ? "Desativar grade estendida" : "Ativar grade estendida"}
                </button>

                {/* 🔥 LOADING */}
                {loading && (
                    <div className="space-y-2 animate-pulse">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-20 bg-zinc-800 rounded-xl" />
                        ))}
                    </div>
                )}

                {/* ❌ ERRO */}
                {erro && !loading && (
                    <div className="bg-red-900/40 border border-red-700 p-4 rounded-xl">
                        <p className="text-red-400 mb-2">Erro: {erro}</p>
                        <button
                            onClick={refetch}
                            className="bg-red-600 px-3 py-1 rounded"
                        >
                            Tentar novamente 🔄
                        </button>
                    </div>
                )}

                {/* 👀 LISTA */}
                {!loading && !erro && (
                    <>
                        {fichas.length === 0 && (
                            <p className="text-yellow-500 text-sm">
                                Nenhuma ficha encontrada 👀
                            </p>
                        )}

                        <DndContext
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={dias.map((d) => d.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {dias.map((dia, index) => (
                                    <SortableItem key={dia.id} id={dia.id}>
                                        <div className="bg-zinc-900 p-4 rounded-xl mb-3">

                                            <div className="text-pink-400 font-semibold">
                                                {getNomeDia(index)}
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
                    </>
                )}

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
