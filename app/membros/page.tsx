"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Ficha = {
  id: string;
  conteudo: string;
  created_at: string;
};

type ApiResponse = {
  success?: boolean;
  data?: Ficha[];
  error?: string;
};

/* ─────────────────────────────────────────────
   🧠 UTIL: título (mantido como fallback)
───────────────────────────────────────────── */
function extractTitle(text: string) {
  const match = text
    .split("\n")
    .find((l) => /t[ií]tulo/i.test(l));

  if (!match) return "Ficha sem título";

  return match.replace(/.*:/, "").trim() || "Ficha sem título";
}

/* ─────────────────────────────────────────────
   👤 UTIL: primeira linha = nome da pessoa
───────────────────────────────────────────── */
function extractFirstLine(text: string) {
  return text.split("\n")[0] || "Sem nome";
}

/* ─────────────────────────────────────────────
   📲 WhatsApp format (inclui negrito no nome)
───────────────────────────────────────────── */
function formatarParaWhatsApp(text: string) {
  return text
    .split("\n")
    .map((line, index) => {
      const isFirst = index === 0;

      // 👤 nome da pessoa
      if (isFirst) {
        return `*${line.trim()}*`;
      }

      // 🧠 campos padrão
      if (!line.includes(":")) return line;

      const [key, value] = line.split(":");

      return `*${key.trim()}:* ${value.trim()}`;
    })
    .join("\n");
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
     🔍 FILTRO
  ───────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return fichas;

    return fichas.filter((f) =>
      f.conteudo.toLowerCase().includes(q)
    );
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
        body: JSON.stringify({ conteudo: editText }),
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
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Membros cadastrados
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Arquivo vivo de todas as fichas enviadas
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar dentro das fichas..."
            className="mt-4 w-full md:w-1/2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </header>

        {/* GRID */}
        {!loading && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <AnimatePresence>
              {filtered.map((ficha, i) => (
                <motion.article
                  key={ficha.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-white dark:bg-zinc-900 border rounded-2xl p-5"
                >

                  {/* 👤 PRIMEIRA LINHA EM NEGRITO (NÃO É TÍTULO) */}
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {extractFirstLine(ficha.conteudo)}
                  </p>

                  {/* 🔥 resto da ficha */}
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap break-words">
                    {ficha.conteudo.split("\n").map((line, idx) => {
                      if (idx === 0) return null; // já usamos acima

                      if (!line.includes(":")) return <p key={idx}>{line}</p>;

                      const [k, v] = line.split(":");

                      return (
                        <p key={idx}>
                          <strong>{k}:</strong> {v}
                        </p>
                      );
                    })}
                  </div>

                  {/* AÇÕES */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => setSelected(ficha)}
                      className="text-xs px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500"
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
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
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
              className="bg-white dark:bg-zinc-900 max-w-6xl w-full p-6 rounded-2xl grid md:grid-cols-2 gap-6"
              onClick={(e) => e.stopPropagation()}
            >

              {/* 📌 ORIGINAL */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 overflow-auto max-h-[75vh]">
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

                    const index = line.indexOf(":");

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
                  className="w-full h-[60vh] p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent font-mono text-sm"
                />

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
