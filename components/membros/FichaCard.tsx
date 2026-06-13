"use client";

import { motion } from "framer-motion";
import { formatarParaWhatsApp } from "@/lib/FormatarFicha";
import { extractFirstLine, findColonOutsideParentheses } from "@/lib/fichaUtils";
import { Ficha } from "@/types/fichas";

type Props = {
  ficha: Ficha;
  index?: number;
  onEdit: (ficha: Ficha) => void;
  onDelete: (id: string) => void;
};

async function copiarFicha(text: string) {
  const formatado = formatarParaWhatsApp(text);

  await navigator.clipboard.writeText(formatado);

  alert("Ficha copiada para WhatsApp ✨");
}

export default function FichaCard({
  ficha,
  index = 0,
  onEdit,
  onDelete,
}: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02 }}
      className="
        bg-white dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-700
        rounded-2xl
        p-4 sm:p-5
        shadow-sm
        hover:shadow-md
        transition
      "
    >
      {/* NOME */}
      <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {extractFirstLine(ficha.conteudo)}
      </p>

      {/* TITULO */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
        {ficha.titulos?.titulo || "Sem título"}
      </p>

      {/* CONTEUDO */}
      <div className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap break-words">
        {ficha.conteudo.split("\n").map((line, idx) => {
          if (idx === 0) return null;

          const isQtdPalavras =
            /quantidade de palavras/i.test(line);

          if (isQtdPalavras) {
            return (
              <p key={idx} className="font-bold">
                {line}
              </p>
            );
          }

          const index = findColonOutsideParentheses(line);

          if (index === -1) {
            return <p key={idx}>{line}</p>;
          }

          const key = line.slice(0, index);
          const value = line.slice(index + 1);

          return (
            <p key={idx}>
              <strong>{key}:</strong>
              {value}
            </p>
          );
        })}
      </div>

      {/* AÇÕES */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => onEdit(ficha)}
          className="
            text-xs sm:text-sm
            px-3 py-1.5
            rounded-lg
            bg-zinc-200
            text-zinc-800
            dark:bg-zinc-800
            dark:text-zinc-100
            hover:bg-zinc-300
            dark:hover:bg-zinc-700
            transition
          "
        >
          Editar
        </button>

        <button
          onClick={() => copiarFicha(ficha.conteudo)}
          className="
            text-xs
            px-3 py-1
            rounded-lg
            bg-green-500/10
            text-green-500
          "
        >
          Copiar
        </button>

        <button
          onClick={() => onDelete(ficha.id)}
          className="
            text-xs
            px-3 py-1
            rounded-lg
            bg-red-500/10
            text-red-500
          "
        >
          Excluir
        </button>
      </div>
    </motion.article>
  );
}