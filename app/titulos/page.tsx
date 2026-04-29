"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Titulo = {
  id?: string;
  titulo: string;
  descricao: string;
};

const defaultTitulo: Titulo = {
  titulo: "",
  descricao: "",
};

export default function TitulosPage() {
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [form, setForm] = useState<Titulo>(defaultTitulo);
  const [loading, setLoading] = useState(false);

  async function fetchTitulos() {
    const { data, error } = await supabase
      .from("titulos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTitulos(data);
    }
  }

  useEffect(() => {
    fetchTitulos();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
    const { data, error } = await supabase
      .from("titulos")
      .insert([form])
      .select();

    if (error) {
      console.error("Erro ao salvar título:", error);
      alert(error.message);
      return;
    }

    setForm(defaultTitulo);
    fetchTitulos();
  } catch (err) {
    console.error("Erro inesperado:", err);
    alert("Erro inesperado ao salvar");
  } finally {
    setLoading(false);
  }
}
  async function handleDelete(id: string) {
    await supabase.from("titulos").delete().eq("id", id);
    fetchTitulos();
  }

  return (
    <main className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">📌 Títulos</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Título"
          value={form.titulo}
          onChange={(e) =>
            setForm({ ...form, titulo: e.target.value })
          }
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
          required
        />

        <textarea
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) =>
            setForm({ ...form, descricao: e.target.value })
          }
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {/* LISTA */}
      <div className="space-y-4">
        {titulos.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-zinc-900 border border-zinc-700 rounded"
          >
            <h2 className="font-bold">{t.titulo}</h2>
            <p className="text-sm text-zinc-400">{t.descricao}</p>

            <button
              onClick={() => handleDelete(t.id!)}
              className="mt-2 text-red-500 text-sm"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
