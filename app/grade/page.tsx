"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { supabase } from "@/lib/supabaseClient";

import { formatarParaWhatsApp } from "@/lib/FormatarFicha";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type Ficha = {
  id: string;
  conteudo: string;
  deletado?: boolean | null;
};

type Dia = {
  id: string;
  fichaId: string | null;
  ficha: Ficha | null;
};

/* ─────────────────────────────
   CONSTANTS
──────────────────────────── */

const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
];

const GATILHOS = [
  "+18",
  "sexo",
  "sexual",
  "erótico",
  "nsfw",
  "violência",
  "abuso",
];

const uid = () => crypto.randomUUID();

const criarGrade = (
  tamanho: number
): Dia[] =>
  Array.from({ length: tamanho }, () => ({
    id: uid(),
    fichaId: null,
    ficha: null,
  }));

const NORMAL_SIZE = 6;
const EXTENDED_SIZE = 11;

/* ─────────────────────────────
   UTILS
──────────────────────────── */

const extrairTitulo = (
  conteudo = ""
) =>
  conteudo
    .split("\n")[0]
    .replace(/\*/g, "")
    .slice(0, 60);

const detectarGatilhos = (
  texto: string
) => {
  const lower = texto.toLowerCase();

  return GATILHOS.filter((g) =>
    lower.includes(g)
  );
};

/* ─────────────────────────────
   SORTABLE ITEM
──────────────────────────── */

const SortableItem = memo(function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:
          CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
});

/* ─────────────────────────────
   HOOK
──────────────────────────── */

function useGrade() {
  const [nomeGrade, setNomeGrade] =
    useState("Vale de Poesias");

  const [dias, setDias] = useState<Dia[]>(
    criarGrade(NORMAL_SIZE)
  );

  const [isExtendida, setIsExtendida] =
    useState(false);

  const alerta = useMemo(() => {
    const conflitos: string[] = [];

    dias.forEach((dia, index) => {
      if (!dia.fichaId) return;

      const ficha = dia.ficha;

      if (!ficha) return;

      const gatilhos =
        detectarGatilhos(
          ficha.conteudo
        );

      if (!gatilhos.length) return;

      const nome =
        index === dias.length - 1
          ? "Obra Extra"
          : DIAS_SEMANA[index % 5];

      conflitos.push(
        `${nome} (${gatilhos.join(
          ", "
        )})`
      );
    });

    return conflitos.length >= 2
      ? `⚠️ Conflito sensível: ${conflitos.join(
          " • "
        )}`
      : null;
  }, [dias, fichasMap]);

  const selectFicha = useCallback(
  (
    diaId: string,
    ficha: Ficha
  ) => {
    setDias((prev) =>
      prev.map((d) =>
        d.id === diaId
          ? {
              ...d,
              fichaId: ficha.id,
              ficha,
            }
          : d
      )
    );
  },
  []
);

  const toggleGrade =
    useCallback(() => {
      setIsExtendida((prev) => {
        const next = !prev;

        setDias(
          criarGrade(
            next
              ? EXTENDED_SIZE
              : NORMAL_SIZE
          )
        );

        return next;
      });
    }, []);

  const handleDragEnd =
    useCallback(
      (event: DragEndEvent) => {
        const { active, over } =
          event;

        if (
          !over ||
          active.id === over.id
        ) {
          return;
        }

        setDias((items) => {
          const oldIndex =
            items.findIndex(
              (i) =>
                i.id === active.id
            );

          const newIndex =
            items.findIndex(
              (i) =>
                i.id === over.id
            );

          return arrayMove(
            items,
            oldIndex,
            newIndex
          );
        });
      },
      []
    );

  const generatedText = useMemo(() => {
    let texto = "";

    texto +=
      "❛ ━━━━━━･❪🌹❫ ･━━━━━━ ❜\n";

    texto += `🌹🩶 ${nomeGrade} 🩶🌹\n`;

    texto +=
      "📜 Grade Oficial da Semana 📜\n";

    texto +=
      "❛ ━━━━━━━━━━━━━━━━ ❜\n";

    dias.forEach((dia, index) => {
      const ficha = dia.ficha;

      const nomeDia =
        index === dias.length - 1
          ? "Obra Extra"
          : DIAS_SEMANA[index % 5];

      texto += `❛ ${nomeDia} ❜\n\n`;

      texto += ficha
        ? formatarParaWhatsApp(
            ficha.conteudo
          ) + "\n"
        : "*(Nenhuma ficha selecionada)*\n";

      texto +=
        "──────────────\n";
    });

    return texto;
  }, [dias, nomeGrade]);

  const copyGrade = useCallback(
    async () => {
      try {
        await navigator.clipboard.writeText(
          generatedText
        );
      } catch (err) {
        console.error(err);
      }
    },
    [generatedText]
  );

  return {
    nomeGrade,
    setNomeGrade,
    dias,
    loading: false,
    isExtendida,
    alerta,
    selectFicha,
    toggleGrade,
    handleDragEnd,
    copyGrade,
  };
}

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function GradePage() {
  const {
    nomeGrade,
    setNomeGrade,
    dias,
    isExtendida,
    alerta,
    selectFicha,
    toggleGrade,
    handleDragEnd,
    copyGrade,
  } = useGrade();

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">

        <Header />

        {alerta && (
          <Alert message={alerta} />
        )}

        <Inputs
          nomeGrade={nomeGrade}
          setNomeGrade={setNomeGrade}
        />

        <ToggleButton
          active={isExtendida}
          onClick={toggleGrade}
        />

        <DndContext
          collisionDetection={
            closestCenter
          }
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={dias.map(
              (d) => d.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {dias.map(
                (dia, index) => (
                  <SortableDay
                    key={dia.id}
                    dia={dia}
                    index={index}
                    diasLength={
                      dias.length
                    }
                    <SortableDay
                        key={dia.id}
                        dia={dia}
                        index={index}
                        diasLength={dias.length}
                        onSelect={selectFicha}
                      />
                    onSelect={
                      selectFicha
                    }
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>

        <CopyButton
          onClick={copyGrade}
        />
      </div>
    </main>
  );
}

/* ─────────────────────────────
   UI
──────────────────────────── */

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-zinc-400">
      Carregando...
    </div>
  );
}

const Header = memo(function Header() {
  return (
    <h1 className="text-3xl font-bold text-pink-500">
      Criador de Grade 🌹
    </h1>
  );
});

const Alert = memo(function Alert({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-xl border border-red-500 bg-red-500/10 p-3 text-red-300">
      {message}
    </div>
  );
});

const Inputs = memo(function Inputs({
  nomeGrade,
  setNomeGrade,
}: {
  nomeGrade: string;
  setNomeGrade: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <input
        value={nomeGrade}
        onChange={(e) =>
          setNomeGrade(
            e.target.value
          )
        }
        placeholder="Nome da grade"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3"
      />
    </div>
  );
});

const ToggleButton = memo(
  function ToggleButton({
    active,
    onClick,
  }: {
    active: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className="rounded-xl bg-purple-600 px-4 py-2 transition hover:bg-purple-700"
      >
        {active
          ? "Desativar grade estendida"
          : "Ativar grade estendida"}
      </button>
    );
  }
);

const SortableDay = memo(
  function SortableDay({
    dia,
    index,
    diasLength,
    onSelect,
  }: {
    dia: Dia;
    index: number;
    diasLength: number;
    onSelect: (
      diaId: string,
      ficha: Ficha
    ) => void;
  }) {
    const [termo, setTermo] =
      useState("");

    const [resultados, setResultados] =
      useState<Ficha[]>([]);

    const [loadingBusca, setLoadingBusca] =
      useState(false);

    useEffect(() => {
      if (termo.length < 2) {
        setResultados([]);
        return;
      }

      const timeout =
        setTimeout(async () => {
          try {
            setLoadingBusca(true);

            const { data } =
              await supabase
                .from("fichas")
                .select(
                  "id, conteudo"
                )
                .ilike(
                  "conteudo",
                  `%${termo}%`
                )
                .not(
                  "deletado",
                  "eq",
                  true
                )
                .limit(10);

            setResultados(
              data ?? []
            );
          } catch (err) {
            console.error(err);
          } finally {
            setLoadingBusca(false);
          }
        }, 300);

      return () =>
        clearTimeout(timeout);
    }, [termo]);

    return (
      <SortableItem id={dia.id}>
        <article className="rounded-2xl bg-zinc-900 p-4">
          <h2 className="font-semibold text-pink-400">
            {index ===
            diasLength - 1
              ? "Obra Extra"
              : DIAS_SEMANA[
                  index % 5
                ]}
          </h2>

          {dia.ficha && (
            <div className="mt-3 rounded-lg bg-green-900/30 p-2 text-green-300">
              {extrairTitulo(
                dia.ficha.conteudo
              )}
            </div>
          )}

          <input
            type="text"
            value={termo}
            onChange={(e) =>
              setTermo(
                e.target.value
              )
            }
            placeholder="Pesquisar ficha..."
            className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3"
          />

          {loadingBusca && (
            <p className="mt-2 text-zinc-400">
              Pesquisando...
            </p>
          )}

          <div className="mt-3 space-y-2">
            {resultados.map(
              (ficha) => (
                <button
                  key={ficha.id}
                  type="button"
                  onClick={() =>
                    onSelect(
                      dia.id,
                      ficha
                    )
                  }
                  className="block w-full rounded-lg bg-zinc-800 p-2 text-left hover:bg-zinc-700"
                >
                  {extrairTitulo(
                    ficha.conteudo
                  )}
                </button>
              )
            )}
          </div>
        </article>
      </SortableItem>
    );
  }
);

const CopyButton = memo(
  function CopyButton({
    onClick,
  }: {
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className="w-full rounded-2xl bg-pink-600 p-4 font-bold transition hover:bg-pink-700"
      >
        Copiar Grade 📋
      </button>
    );
  }
);
