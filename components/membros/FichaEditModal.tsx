"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Ficha, Titulo } from "@/types/fichas";
import { findColonOutsideParentheses } from "@/lib/fichaUtils";

type Props = {
  open: boolean;
  ficha: Ficha | null;
  editText: string;
  saving: boolean;
  titulos: Titulo[];

  onClose: () => void;
  onSave: () => void;
  onEditTextChange: (value: string) => void;
  onTituloChange: (tituloId: string) => void;
  onRemoveTitulo: () => void;
};

export default function FichaEditModal({
  open,
  ficha,
  editText,
  saving,
  titulos,
  onClose,
  onSave,
  onEditTextChange,
  onTituloChange,
  onRemoveTitulo,
}: Props) {
  if (!ficha) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="
              bg-white dark:bg-zinc-900
              w-full max-w-6xl
              h-full sm:h-auto
              p-4 sm:p-6
              rounded-2xl
              grid grid-cols-1 md:grid-cols-2
              gap-4 sm:gap-6
              overflow-y-auto
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* ORIGINAL */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 overflow-auto max-h-[50vh] sm:max-h-[70vh]">
              <h3 className="text-sm font-bold text-gray-500 mb-3">
                Original (Banco de Dados)
              </h3>

              <p className="font-bold text-lg mb-3">
                {ficha.conteudo.split("\n")[0]}
              </p>

              <div className="text-sm space-y-1 text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                {ficha.conteudo.split("\n").map((line, idx) => {
                  if (idx === 0) return null;

                  if (!line.includes(":")) {
                    return <p key={idx}>{line}</p>;
                  }

                  const isQtdPalavras =
                    /quantidade de palavras/i.test(line);

                  if (isQtdPalavras) {
                    return (
                      <p key={idx} className="font-bold">
                        {line}
                      </p>
                    );
                  }

                  const index =
                    findColonOutsideParentheses(line);

                  const k =
                    index !== -1
                      ? line.slice(0, index)
                      : line;

                  const v =
                    index !== -1
                      ? line.slice(index + 1)
                      : "";

                  return (
                    <p key={idx}>
                      <strong>{k}:</strong> {v}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* EDIÇÃO */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-3">
                Edição (tempo real)
              </h3>

              <textarea
                value={editText}
                onChange={(e) =>
                  onEditTextChange(e.target.value)
                }
                className="
                  w-full
                  h-[50vh] sm:h-[60vh]
                  p-3
                  rounded-xl
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  bg-white
                  dark:bg-zinc-900
                "
              />

              {/* TITULO */}
              <select
                value={ficha.titulos?.id || ""}
                onChange={(e) =>
                  onTituloChange(e.target.value)
                }
                className="
                  w-full
                  mt-3
                  mb-3
                  p-2
                  rounded
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  bg-white
                  dark:bg-zinc-900
                "
              >
                <option value="">
                  Sem título
                </option>

                {titulos.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                  >
                    {t.titulo}
                  </option>
                ))}
              </select>

              <button
                onClick={onRemoveTitulo}
                className="mt-2 text-xs text-red-500"
              >
                Remover título
              </button>

              <button
                onClick={onSave}
                disabled={saving}
                className="
                  mt-4
                  w-full
                  bg-[var(--primary)]
                  text-white
                  py-2
                  rounded-xl
                "
              >
                {saving
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}