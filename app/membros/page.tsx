"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatarParaWhatsApp } from "@/lib/FormatarFicha";
import { supabase } from "@/lib/supabaseClient";

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

type Titulo = {
  id: string;
  titulo: string;
};

/* ─────────────────────────────────────────────
   👤 UTIL: primeira linha = nome da pessoa
───────────────────────────────────────────── */
function extractFirstLine(text: string) {
  return text.split("\n")[0] || "Sem nome";
}

/* ─────────────────────────────────────────────
    🧹 UTIL: limpar formatação do WhatsApp (para edição)
───────────────────────────────────────────── */
function limparFormatacaoWhatsApp(text: string) {
  return text
    // remove negrito/itálico do WhatsApp
    .replace(/\*/g, "")
    .replace(/_/g, "")
    .replace(/~/g, "")
    .replace(/```/g, "")
    // remove espaços duplicados estranhos
    .replace(/[ \t]+/g, " ")
    .trim();
}

/* ─────────────────────────────────────────────
    🧹 Função de evitar : do especifique
───────────────────────────────────────────── */

function findColonOutsideParentheses(text: string): number {
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "(") depth++;
    else if (char === ")") depth--;

    if (char === ":" && depth === 0) {
      return i;
    }
  }

  return -1;
}

/* ─────────────────────────────────────────────
   📋 COPY
───────────────────────────────────────────── */
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
  const [titulosList, setTitulosList] = useState<Titulo[]>([]);

  /* ─────────────────────────────────────────────
     📦 FETCH
  ───────────────────────────────────────────── */
useEffect(() => {
  let isMounted = true;

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // 🔄 paralelo: API + banco direto
      const [fichasRes, titulosRes] = await Promise.allSettled([
        fetch("/api/fichas"),
        supabase
          .from("titulos")
          .select("id, titulo")
          .order("titulo"),
      ]);

      // 📄 FICHAS
      if (fichasRes.status === "fulfilled") {
        const res = fichasRes.value;
        const json: ApiResponse = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json.error || "Erro ao buscar fichas");
        }

        if (isMounted) {
          setFichas(Array.isArray(json.data) ? json.data : []);
        }
      }

      // 🏷️ TÍTULOS
      if (titulosRes.status === "fulfilled") {
        const { data, error } = titulosRes.value;

        if (error) {
          console.error("Erro ao buscar títulos:", error);
        } else if (isMounted) {
          setTitulosList(data || []);
        }
      }
    } catch (err) {
      console.error(err);

      if (isMounted) {
        setError("Não foi possível carregar os dados.");
        setFichas([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }

  loadData();

  return () => {
    isMounted = false;
  };
}, []);

  /* ─────────────────────────────────────────────
     🔍 FILTRO
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
        body: JSON.stringify({ conteudo: editText,
                             titulo_id: selected.titulos?.id || null,
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
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
       <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Membros cadastrados
          </h1>

           <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Arquivo vivo de todas as fichas enviadas
          </p>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar dentro das fichas..."
              className="mt-4 w-full sm:w-2/3 lg:w-1/2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
        </header>

        {/* GRID */}
        {!loading && Object.keys(grouped).length > 0 && (
          <div className="space-y-10">
        
            {Object.entries(grouped).map(([titulo, lista]) => (
              <div key={titulo}>
        
                {/* 🏷️ TÍTULO */}
                <h2 className="text-lg font-semibold mb-4 text-zinc-500">
                  {titulo}
                </h2>
        
                {/* GRID DO GRUPO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        
                  <AnimatePresence>
                    {lista.map((ficha, i) => (
                      <motion.article
                        key={ficha.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.02 }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                      >
        
                        {/* 👤 NOME */}
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                          {extractFirstLine(ficha.conteudo)}
                        </p>
        
                        {/* 🏷️ SUBTÍTULO */}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                          {ficha.titulos?.titulo || "Sem título"}
                        </p>
        
                        {/* 📄 CONTEÚDO */}
                        <div className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap break-words">
                          {ficha.conteudo.split("\n").map((line, idx) => {
                            if (idx === 0) return null;
        
                            const isQtdPalavras = /quantidade de palavras/i.test(line);
        
                            if (isQtdPalavras) {
                              return (
                                <p key={idx} className="font-bold">
                                  {line}
                                </p>
                              );
                            }
        
                            const index = line.indexOf(":");
        
                            if (index === -1) {
                              return <p key={idx}>{line}</p>;
                            }
        
                            const k = line.slice(0, index);
                            const v = line.slice(index + 1);
        
                            return (
                              <p key={idx}>
                                <strong>{k}:</strong>{v}
                              </p>
                            );
                          })}
                        </div>
        
                        {/* AÇÕES */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => {
                              setSelected(ficha);
                              setEditText(limparFormatacaoWhatsApp(ficha.conteudo));
                            }}
                            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
                          >
                            Editar
                          </button>
        
                          <button
                            onClick={() => copiarFicha(ficha.conteudo)}
                            className="text-xs px-3 py-1 rounded-lg bg-green-500/10 text-green-500"
                          >
                            Copiar
                          </button>
        
                          <button
                            onClick={() => handleDelete(ficha.id)}
                            className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-500"
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
          <div className="mt-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center text-gray-500">
            {search
              ? "Nenhuma ficha corresponde à busca."
              : "Nenhuma ficha cadastrada ainda."}
          </div>
        )}

      </div>

      {/* MODAL (EDITOR MELHORADO COM PREVIEW) */}
      {/* MODAL COM COMPARAÇÃO (ORIGINAL x EDIT) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white dark:bg-zinc-900 w-full max-w-6xl h-full sm:h-auto p-4 sm:p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >

              {/* 📌 ORIGINAL */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 overflow-auto max-h-[50vh] sm:max-h-[70vh]">
                <h3 className="text-sm font-bold text-gray-500 mb-3">
                  Original (Banco de Dados)
                </h3>

                {/* 👤 nome */}
                <p className="font-bold text-lg mb-3">
                  {selected.conteudo.split("\n")[0]}
                </p>

                {/* 📄 conteúdo original */}
                <div className="text-sm space-y-1 text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                  {selected.conteudo.split("\n").map((line, idx) => {
                    if (idx === 0) return null;

                    if (!line.includes(":")) {
                      return <p key={idx}>{line}</p>;
                    }

                    const isQtdPalavras = /quantidade de palavras/i.test(line);

                    if (isQtdPalavras) {
                      return (
                        <p key={idx} className="font-bold">
                          {line}
                        </p>
                      );
                    }

                    const index = findColonOutsideParentheses(line);

                    const k = index !== -1 ? line.slice(0, index) : line;
                    const v = index !== -1 ? line.slice(index + 1) : "";

                    return (
                      <p key={idx}>
                        <strong>{k}:</strong> {v}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* ✏️ EDITOR */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-3">
                  Edição (tempo real)
                </h3>

                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-[50vh] sm:h-[60vh]"
                />

                {/* SELECT DE TÍTULOS */}
                <select
                    value={selected.titulos?.id || ""}
                    onChange={(e) => {
                      const id = e.target.value;
  
                      const t = titulosList.find((x) => x.id === id);
  
                          setSelected((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  titulos: t
                                    ? { id: t.id, titulo: t.titulo }
                                    : undefined,
                                }
                              : prev
                          );
                        }}
                        className="w-full mb-3 p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="">Sem título</option>
                        {titulosList.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.titulo}
                          </option>
                        ))}
                    </select>

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
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
