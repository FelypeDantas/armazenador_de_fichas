"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type Titulo = {
  id?: string;
  titulo: string;
  descricao: string;
};

const defaultTitulo: Titulo = {
  titulo: "",
  descricao: "",
};

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function TitulosPage() {
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [form, setForm] = useState<Titulo>(defaultTitulo);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  /* ─────────────────────────────
     HELPERS
  ───────────────────────────── */

  const setError = (msg: string, err?: unknown) => {
    console.error(err);
    setStatus(msg);
  };

  const resetStatus = () => setStatus(null);

  /* ─────────────────────────────
     FETCH
  ───────────────────────────── */

  const fetchTitulos = useCallback(async () => {
    try {
      setFetching(true);

      const { data, error } = await supabase
        .from("titulos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTitulos(data ?? []);
    } catch (err) {
      setError("❌ Erro ao carregar títulos", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchTitulos();
  }, [fetchTitulos]);

  /* ─────────────────────────────
     ACTIONS
  ───────────────────────────── */

  const handleChange = useCallback(
    (field: keyof Titulo, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();

    if (!form.titulo.trim()) {
      setStatus("⚠️ O título é obrigatório");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("titulos").insert({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        user_id: user?.id ?? null,
      });

      if (error) throw error;

      setForm(defaultTitulo);
      setStatus("✅ Título criado com sucesso");

      fetchTitulos();
    } catch (err) {
      setError("❌ Erro ao salvar título", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setStatus(null);

      const { error } = await supabase
        .from("titulos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTitulos((prev) => prev.filter((t) => t.id !== id));
      setStatus("🗑️ Título removido");
    } catch (err) {
      setError("❌ Erro ao excluir título", err);
    }
  };

  /* ─────────────────────────────
     UI
  ───────────────────────────── */

  return (
    <main className="p-6 max-w-3xl mx-auto text-white space-y-6">

      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-bold">📌 Títulos</h1>
        <p className="text-sm text-zinc-400">
          Gerencie títulos e descrições do sistema
        </p>
      </header>

      {/* STATUS */}
      {status && (
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded text-sm">
          {status}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Título"
          value={form.titulo}
          onChange={(e) => handleChange("titulo", e.target.value)}
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        />

        <textarea
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) => handleChange("descricao", e.target.value)}
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {/* LISTA */}
      <section className="space-y-4">

        {fetching ? (
          <p className="text-zinc-400 text-sm">Carregando títulos...</p>
        ) : titulos.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            Nenhum título cadastrado ainda.
          </p>
        ) : (
          titulos.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl"
            >
              <h2 className="font-semibold">{t.titulo}</h2>

              {t.descricao && (
                <p className="text-sm text-zinc-400 mt-1">
                  {t.descricao}
                </p>
              )}

              <button
                onClick={() => handleDelete(t.id!)}
                className="mt-3 text-red-400 text-xs hover:underline"
              >
                Excluir
              </button>
            </div>
          ))
        )}

      </section>
    </main>
  );
}
