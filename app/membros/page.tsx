"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatarParaWhatsApp } from "@/lib/FormatarFicha";

type Ficha = {
  id: string;
  conteudo: string;
  created_at: string;
  titulos?: {
    id: string;
    titulo: string;
  };
};

type ApiResponse = {
  success?: boolean;
  data?: Ficha[];
  error?: string;
};

/* ─────────────────────────────────────────────
   👤 UTIL
───────────────────────────────────────────── */
function extractFirstLine(text: string) {
  return text.split("\n")[0] || "Sem nome";
}

function limparFormatacaoWhatsApp(text: string) {
  return text
    .replace(/\*/g, "")
    .replace(/_/g, "")
    .replace(/~/g, "")
    .replace(/```/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

async function copiarFicha(text: string) {
  const formatado = formatarParaWhatsApp(text);
  await navigator.clipboard.writeText(formatado);
  alert("Ficha copiada para WhatsApp ✨");
}

export default function MembrosPage() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Ficha | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ─────────────────────────────────────────────
     📦 FETCH
  ───────────────────────────────────────────── */
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/fichas");
        const json: ApiResponse = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json.error || "Erro ao buscar fichas");
        }

        if (!active) return;

        setFichas(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Não foi possível carregar as fichas.");
          setFichas([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  /* ─────────────────────────────────────────────
     🔍 FILTRO + 🧩 AGRUPAMENTO + 🔤 ORDEM
  ───────────────────────────────────────────── */
  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();

    let base = fichas;

    if (q) {
      base = fichas.filter((f) =>
        f.conteudo.toLowerCase().includes(q)
      );
    }

    const sorted = [...base].sort((a, b) =>
      extractFirstLine(a.conteudo).localeCompare(
        extractFirstLine(b.conteudo),
        "pt-BR"
      )
    );

    const groups: Record<string, Ficha[]> = {};

    for (const ficha of sorted) {
      const titulo = ficha.titulos?.titulo || "Sem título";

      if (!groups[titulo]) {
        groups[titulo] = [];
      }

      groups[titulo].push(ficha);
    }

    return groups;
  }, [search, fichas]);

  /* ─────────────────────────────────────────────
     ✏️ UPDATE
  ───────────────────────────────────────────── */
  async function handleUpdate() {
    if (!selected) return;

    try {
      setSaving(true);

      const res = await fetch(`/api/fichas/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo: editText,
          titulo_id: selected.titulos?.id || null, // 🔥 permite desvincular
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json.error);

      setFichas((prev) =>
        prev.map((f) =>
          f.id === selected.id ? json.data : f
        )
      );

      setSelected(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar ficha");
    } finally {
      setSaving(false);
    }
  }

  /* ─────────────────────────────────────────────
     🗑️ DELETE
  ───────────────────────────────────────────── */
  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir essa ficha?")) return;

    try {
      const res = await fetch(`/api/fichas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setFichas((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("Erro ao excluir ficha");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-4 py-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold">
            Membros cadastrados
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Arquivo vivo de todas as fichas enviadas
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar dentro das fichas..."
            className="mt-4 w-full px-4 py-2 rounded-xl border"
          />
        </header>

        {/* AGRUPADO */}
        {!loading && Object.keys(grouped).length > 0 && (
          <div className="space-y-10">
            {Object.entries(grouped).map(([titulo, lista]) => (
              <div key={titulo}>

                {/* 🏷️ TÍTULO */}
                <h2 className="text-lg font-semibold mb-4 text-zinc-500">
                  {titulo}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                  <AnimatePresence>
                    {lista.map((ficha, i) => (
                      <motion.article
                        key={ficha.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                      >

                        {/* 👤 NOME */}
                        <p className="font-bold">
                          {extractFirstLine(ficha.conteudo)}
                        </p>

                        {/* 🏷️ SUBTÍTULO */}
                        <p className="text-xs text-zinc-500 mb-2">
                          {ficha.titulos?.titulo || "Sem título"}
                        </p>

                        {/* 📄 CONTEÚDO */}
                        <div className="text-sm whitespace-pre-wrap">
                          {ficha.conteudo.split("\n").slice(1).join("\n")}
                        </div>

                        {/* AÇÕES */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => {
                              setSelected(ficha);
                              setEditText(
                                limparFormatacaoWhatsApp(ficha.conteudo)
                              );
                            }}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              copiarFicha(ficha.conteudo)
                            }
                          >
                            Copiar
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(ficha.id)
                            }
                          >
                            Excluir
                          </button>
                        </div>

                      </motion.article>
                    ))}
                  </AnimatePresence>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && Object.keys(grouped).length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            {search
              ? "Nenhuma ficha corresponde à busca."
              : "Nenhuma ficha cadastrada ainda."}
          </div>
        )}
      </div>

      {/* MODAL (mantido como está, só com ajuste no update) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white dark:bg-zinc-900 w-full max-w-4xl p-6 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-[300px]"
              />

              {/* 🔥 BOTÃO DESVINCULAR */}
              <button
                onClick={() =>
                  setSelected((prev) =>
                    prev ? { ...prev, titulos: undefined } : prev
                  )
                }
                className="mt-2 text-xs text-red-500"
              >
                Remover título
              </button>

              <button
                onClick={handleUpdate}
                disabled={saving}
                className="mt-4 w-full bg-[var(--primary)] text-white py-2 rounded-xl"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
