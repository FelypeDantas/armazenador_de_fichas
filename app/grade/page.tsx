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

const GATILHOS_SENSIVEIS = [
  "+18",
  "sexo",
  "sexual",
  "erótico",
  "nsfw",
  "violência",
  "abuso",
];

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

/* ─────────────────────────────
   UTILS
──────────────────────────── */

const uid = () => crypto.randomUUID();

const criarGrade = (tamanho: number): Dia[] =>
  Array.from({ length: tamanho }, () => ({
    id: uid(),
    fichaId: null,
  }));

const criarGradeNormal = () => criarGrade(6);
const criarGradeEstendida = () => criarGrade(11);

const detectarGatilhos = (texto: string) => {
  const t = texto.toLowerCase();
  return GATILHOS_SENSIVEIS.filter((g) => t.includes(g));
};

const extrairTitulo = (conteudo: string = "") =>
  conteudo.split("\n")[0].replace(/\*/g, "").slice(0, 60);

/* ─────────────────────────────
   DRAG ITEM
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
   COMPONENT
──────────────────────────── */

export default function GradePage() {
  const [nomeGrade, setNomeGrade] = useState("Vale de Poesias");
  const [dias, setDias] = useState<Dia[]>(criarGradeNormal());
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [isExtendida, setIsExtendida] = useState(false);

  /* ─────────────────────────────
     FETCH
  ───────────────────────────── */

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("fichas")
        .select("id, conteudo, deletado")
        .not("deletado", "eq", true);

      if (!alive) return;

      if (!error) setFichas(data ?? []);
      setLoading(false);
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  /* ─────────────────────────────
     DERIVED DATA
──────────────────────────── */

  const fichasFiltradas = useMemo(() => {
    const q = busca.toLowerCase();
    return fichas.filter((f) =>
      f.conteudo.toLowerCase().includes(q)
    );
  }, [busca, fichas]);

  const fichasMap = useMemo(() => {
    return new Map(fichas.map((f) => [f.id, f]));
  }, [fichas]);

  const alertaGatilhos = useMemo(() => {
    const conflitos: string[] = [];

    dias.forEach((dia, i) => {
      const ficha = dia.fichaId ? fichasMap.get(dia.fichaId) : null;
      if (!ficha) return;

      const gatilhos = detectarGatilhos(ficha.conteudo);
      if (!gatilhos.length) return;

      const nome =
        i === dias.length - 1 ? "Obra Extra" : DIAS_SEMANA[i % 5];

      conflitos.push(`${nome} (${gatilhos.join(", ")})`);
    });

    return conflitos.length >= 2
      ? `⚠️ Conflito de conteúdo sensível entre: ${conflitos.join(" | ")}`
      : null;
  }, [dias, fichasMap]);

  /* ─────────────────────────────
     ACTIONS
  ───────────────────────────── */

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
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function toggleGrade() {
    setIsExtendida((prev) => {
      const next = !prev;
      setDias(next ? criarGradeEstendida() : criarGradeNormal());
      return next;
    });
  }

  function gerarTexto() {
    let texto = `❛ ━━━━━━･❪🌹❫ ･━━━━━━ ❜\n`;
    texto += `🌹🩶 ${nomeGrade} 🩶🌹\n`;
    texto += `📜 Grade Oficial da Semana 📜\n`;
    texto += `❛ ━━━━━━━━━━━━━━━━ ❜\n`;

    dias.forEach((dia, i) => {
      const ficha = dia.fichaId ? fichasMap.get(dia.fichaId) : null;

      const nomeDia =
        i === dias.length - 1 ? "Obra Extra" : DIAS_SEMANA[i % 5];

      texto += `❛ ${nomeDia} ❜\n\n`;
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

  /* ─────────────────────────────
     LOADING
  ───────────────────────────── */

  if (loading) {
    return (
      <div className="p-10 text-center text-zinc-400">
        Carregando...
      </div>
    );
  }

  /* ─────────────────────────────
     UI
  ───────────────────────────── */

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
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
        />

        <button
          onClick={toggleGrade}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          {isExtendida
            ? "Desativar grade estendida"
            : "Ativar grade estendida"}
        </button>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={dias.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {dias.map((dia, i) => (
              <SortableItem key={dia.id} id={dia.id}>
                <div className="bg-zinc-900 p-4 rounded-xl mb-3">

                  <div className="text-pink-400 font-semibold">
                    {i === dias.length - 1
                      ? "Obra Extra"
                      : DIAS_SEMANA[i % 5]}
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
