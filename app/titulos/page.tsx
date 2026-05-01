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

type Status = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const defaultTitulo: Titulo = {
  titulo: "",
  descricao: "",
};

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function TitulosPage() {
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [form, setForm] = useState(defaultTitulo);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<Status>(null);

  /* ─────────────────────────────
     HELPERS
  ───────────────────────────── */

  const setError = (message: string, err?: unknown) => {
    console.error(err);
    setStatus({ type: "error", message });
  };

  const setSuccess = (message: string) => {
    setStatus({ type: "success", message });
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
      setError("Erro ao carregar títulos", err);
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
    (field: keyof Titulo) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;

        setForm((prev) => ({
          ...prev,
          [field]: value,
        }));
      },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();

    const titulo = form.titulo.trim();
    const descricao = form.descricao.trim();

    if (!titulo) {
      setStatus({ type: "info", message: "O título é obrigatório" });
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("titulos")
        .insert({
          titulo,
          descricao,
          user_id: user?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      setTitulos((prev) => [data, ...prev]); // 🚀 otimista
      setForm(defaultTitulo);
      setSuccess("Título criado com sucesso");
    } catch (err) {
      setError("Erro ao salvar título", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const previous = titulos;

    try {
      // 🚀 remoção otimista
      setTitulos((prev) => prev.filter((t) => t.id !== id));

      const { error } = await supabase
        .from("titulos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSuccess("Título removido");
    } catch (err) {
      setTitulos(previous); // rollback
      setError("Erro ao excluir título", err);
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
        <div
          className={`px-4 py-2 rounded text-sm border
            ${
              status.type === "error"
                ? "bg-red-500/10 border-red-500 text-red-300"
                : status.type === "success"
                ? "bg-green-500/10 border-green-500 text-green-300"
                : "bg-yellow-500/10 border-yellow-500 text-yellow-300"
            }`}
        >
          {status.message}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange("titulo")}
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        />

        <textarea
          placeholder="Descrição"
          value={form.descricao}
          onChange={handleChange("descricao")}
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
