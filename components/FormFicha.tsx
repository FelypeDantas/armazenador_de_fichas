"use client";

import { useState } from "react";

type Status = "idle" | "success" | "error";

export default function FormFicha() {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const conteudo = texto.trim();
    if (!conteudo) {
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/fichas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conteudo }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        console.error("Falha ao salvar ficha:", data);
        setStatus("error");
        return;
      }

      setTexto("");
      setStatus("success");
    } catch (err) {
      console.error("Erro de rede:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full h-80 p-4 rounded-xl border bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4"
    >
      <label className="text-sm text-zinc-500">
        Cole sua ficha completa abaixo:
      </label>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Cole aqui sua ficha..."
        className={`${inputBase} border-zinc-300 dark:border-zinc-700`}
      />

      {status === "success" && (
        <p className="text-green-500 text-sm">
          Ficha salva com sucesso 🧾✨
        </p>
      )}

      {status === "error" && (
        <p className="text-red-500 text-sm">
          Erro ao salvar ficha 😢
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`
          w-full py-3 rounded-xl font-semibold transition
          ${
            loading
              ? "bg-zinc-400 cursor-not-allowed"
              : "bg-[var(--primary)] hover:opacity-90 text-white"
          }
        `}
      >
        {loading ? "Salvando..." : "Salvar ficha"}
      </button>
    </form>
  );
}
