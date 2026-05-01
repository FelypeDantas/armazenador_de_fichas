"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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

/* ─────────────────────────────
   TYPES
──────────────────────────── */

interface Ficha {
  id: string;
  conteudo: string;
  deletado?: boolean | null;
}

interface Dia {
  id: string;
  fichaId: string | null;
}

/* ─────────────────────────────
   CONSTANTS
──────────────────────────── */

const GATILHOS = [
  "+18",
  "sexo",
  "sexual",
  "erótico",
  "nsfw",
  "violência",
  "abuso",
];

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

/* ─────────────────────────────
   UTILS
──────────────────────────── */

const uid = () => crypto.randomUUID();

const criarGrade = (tamanho: number): Dia[] =>
  Array.from({ length: tamanho }, () => ({
    id: uid(),
    fichaId: null,
  }));

const extrairTitulo = (conteudo = "") =>
  conteudo.split("\n")[0].replace(/\*/g, "").slice(0, 60);

const detectarGatilhos = (texto: string) => {
  const t = texto.toLowerCase();
  return GATILHOS.filter((g) => t.includes(g));
};

/* ─────────────────────────────
   SORTABLE ITEM
──────────────────────────── */

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

/* ─────────────────────────────
   HOOK (DATA)
──────────────────────────── */

function useFichas() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("fichas")
        .select("id, conteudo, deletado")
        .not("deletado", "eq", true);

      if (mounted) {
        setFichas(data ?? []);
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { fichas, loading };
}

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function GradePage() {
  const { fichas, loading } = useFichas();

  const [nomeGrade, setNomeGrade] = useState("Vale de Poesias");
  const [dias, setDias] = useState<Dia[]>(criarGrade(6));
  const [busca, setBusca] = useState("");
  const [extendida, setExtendida] = useState(false);

  /* ─────────────────────────────
     DERIVED
  ───────────────────────────── */

  const fichasMap = useMemo(
    () => new Map(fichas.map((f) => [f.id, f])),
    [fichas]
  );

  const fichasFiltradas = useMemo(() => {
    const q = busca.toLowerCase();
    return fichas.filter((f) =>
      f.conteudo.toLowerCase().includes(q)
    );
  }, [busca, fichas]);

  const alerta = useMemo(() => {
    const conflitos: string[] = [];

    dias.forEach((dia, i) => {
      const ficha = fichasMap.get(dia.fichaId || "");
      if (!ficha) return;

      const gatilhos = detectarGatilhos(ficha.conteudo);
      if (!gatilhos.length) return;

      const nome =
        i === dias.length - 1 ? "Obra Extra" : DIAS[i % 5];

      conflitos.push(`${nome} (${gatilhos.join(", ")})`);
    });

    return conflitos.length >= 2
      ? `⚠️ Conflito: ${conflitos.join(" | ")}`
      : null;
  }, [dias, fichasMap]);

  /* ─────────────────────────────
     ACTIONS
  ───────────────────────────── */

  const selecionarFicha = useCallback((diaId: string, fichaId: string) => {
    setDias((prev) =>
      prev.map((d) =>
        d.id === diaId ? { ...d, fichaId: fichaId || null } : d
      )
    );
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDias((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  const toggleGrade = () => {
    setExtendida((prev) => {
      const next = !prev;
      setDias(criarGrade(next ? 11 : 6));
      return next;
    });
  };

  const gerarTexto = () => {
    return [
      "❛ ━━━━━━･❪🌹❫ ･━━━━━━ ❜",
      `🌹🩶 ${nomeGrade} 🩶🌹`,
      "📜 Grade Oficial da Semana 📜",
      "❛ ━━━━━━━━━━━━━━━━ ❜",
      ...dias.map((dia, i) => {
        const ficha = fichasMap.get(dia.fichaId || "");
        const nome =
          i === dias.length - 1 ? "Obra Extra" : DIAS[i % 5];

        return [
          `❛ ${nome} ❜`,
          "",
          ficha
            ? formatarParaWhatsApp(ficha.conteudo)
            : "*(Nenhuma ficha selecionada)*",
          "──────────────",
        ].join("\n");
      }),
    ].join("\n");
  };

  const copiar = async () => {
    await navigator.clipboard.writeText(gerarTexto());
    alert("Grade copiada 🚀");
  };

  /* ─────────────────────────────
     UI
  ───────────────────────────── */

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <Header />

        {alerta && <Alert message={alerta} />}

        <Controls
          nome={nomeGrade}
          setNome={setNomeGrade}
          busca={busca}
          setBusca={setBusca}
          extendida={extendida}
          toggle={toggleGrade}
        />

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={dias.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {dias.map((dia, i) => (
              <SortableItem key={dia.id} id={dia.id}>
                <DiaCard
                  index={i}
                  dia={dia}
                  fichas={fichasFiltradas}
                  onSelect={selecionarFicha}
                />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        <CopyButton onClick={copiar} />

      </div>
    </div>
  );
}

/* ─────────────────────────────
   UI PARTS
──────────────────────────── */

function Header() {
  return (
    <h1 className="text-3xl font-bold text-pink-500">
      Criador de Grade 🌹
    </h1>
  );
}

function Alert({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500 text-red-300 p-3 rounded-xl">
      {message}
    </div>
  );
}

function Controls({ nome, setNome, busca, setBusca, extendida, toggle }: any) {
  return (
    <>
      <input value={nome} onChange={(e) => setNome(e.target.value)} className="input" />
      <input value={busca} onChange={(e) => setBusca(e.target.value)} className="input" />
      <button onClick={toggle} className="btn">
        {extendida ? "Desativar grade estendida" : "Ativar grade estendida"}
      </button>
    </>
  );
}

function DiaCard({ index, dia, fichas, onSelect }: any) {
  const nome = index === fichas.length - 1 ? "Obra Extra" : DIAS[index % 5];

  return (
    <div className="bg-zinc-900 p-4 rounded-xl mb-3">
      <div className="text-pink-400 font-semibold">{nome}</div>

      <select
        value={dia.fichaId ?? ""}
        onChange={(e) => onSelect(dia.id, e.target.value)}
        className="w-full mt-2 p-2 bg-zinc-800 rounded"
      >
        <option value="">Selecionar ficha</option>
        {fichas.map((f: Ficha) => (
          <option key={f.id} value={f.id}>
            {extrairTitulo(f.conteudo)}
          </option>
        ))}
      </select>
    </div>
  );
}

function CopyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-pink-600 p-4 rounded-xl font-bold"
    >
      Copiar Grade 📋
    </button>
  );
}

function Loading() {
  return (
    <div className="p-10 text-center text-zinc-400">
      Carregando...
    </div>
  );
}
