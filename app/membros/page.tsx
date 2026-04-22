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

export default function MembrosPage() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Ficha | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📦 FETCH
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

  // 🔍 FILTRO
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return fichas;

    return fichas.filter((f) =>
      f.conteudo.toLowerCase().includes(q)
    );
  }, [search, fichas]);

  // 🧠 título
  function extractTitle(text: string) {
    const match = text
      .split("\n")
      .find((l) => /t[ií]tulo/i.test(l));

    if (!match) return "Ficha sem título";

    return match.replace(/.*:/, "").trim() || "Ficha sem título";
  }

  // 🔁 abrir modal já preenchendo edição
  useEffect(() => {
    if (selected) {
      setEditText(selected.conteudo);
    }
  }, [selected]);

  // ⌨️ ESC fecha
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ✏️ UPDATE
  async function handleUpdate() {
    if (!selected) return;

    try {
      setSaving(true);

      const res = await fetch(`/api/fichas/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conteudo: editText }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || "Erro ao atualizar");
      }

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

  // 🗑️ DELETE
  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir essa ficha?")) return;

    try {
      const res = await fetch(`/api/fichas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setFichas((prev) =>
        prev.filter((f) => f.id !== id)
      );
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

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="text-gray-500 animate-pulse">
            Carregando fichas...
          </div>
        )}

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
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
                >
                  <div
                    onClick={() => setSelected(ficha)}
                    className="cursor-pointer"
                  >
                    <h2 className="font-semibold mb-2 text-[var(--primary)]">
                      {extractTitle(ficha.conteudo)}
                    </h2>

                    <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-6">
                      {ficha.conteudo}
                    </p>

                    <span className="text-xs text-gray-400 mt-3 block">
                      {new Date(ficha.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {/* AÇÕES */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelected(ficha)}
                      className="text-xs px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500"
                    >
                      Editar
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

      {/* MODAL */}
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
              className="bg-white dark:bg-zinc-900 max-w-3xl w-full max-h-[85vh] overflow-auto p-6 rounded-2xl"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-4">
                Editar ficha
              </h2>

              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-60 p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
              />

              <button
                onClick={handleUpdate}
                disabled={saving}
                className="mt-4 w-full bg-[var(--primary)] text-white py-2 rounded-xl"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}