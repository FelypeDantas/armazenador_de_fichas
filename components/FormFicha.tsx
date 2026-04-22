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

    try {
      setLoading(true);
      setStatus("idle");

      const res = await fetch("/api/fichas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ conteudo }),
      });

      // 🧠 tenta ler resposta com segurança
      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      // ❌ erro vindo da API
      if (!res.ok) {
        console.error("API error:", data);
        setStatus("error");
        return;
      }

      // 🧼 valida resposta esperada
      if (!data?.success) {
        console.error("Resposta inesperada:", data);
        setStatus("error");
        return;
      }

      setTexto("");
      setStatus("success");
    } catch (error) {
      console.error("Network error:", error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

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
        className="w-full h-80 p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
      />

      {/* STATUS */}
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
          ${loading
            ? "bg-zinc-400 cursor-not-allowed"
            : "bg-[var(--primary)] hover:opacity-90 text-white"}
        `}
      >
        {loading ? "Salvando..." : "Salvar ficha"}
      </button>
    </form>
  );
}