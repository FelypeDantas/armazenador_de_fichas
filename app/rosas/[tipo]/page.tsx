"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { useFichas } from "@/hooks/useFichas";

import MembrosHeader from "@/components/membros/MembrosHeader";
import FichaCard from "@/components/membros/FichaCard";
import FichaEditModal from "@/components/membros/FichaEditModal";
import Pagination from "@/components/membros/Pagination";

import {
  extractFirstLine,
  limparFormatacaoWhatsApp,
} from "@/lib/fichaUtils";

import { obterCategoriaPorIdade } from "@/lib/idadeUtils";

import { Ficha } from "@/types/fichas";

const ITEMS_PER_PAGE = 12;

export default function MembrosPage() {
  const params = useParams();

  const tipo =
    params?.tipo as
      | "vermelhas"
      | "brancas"
      | undefined;

  const {
    fichas,
    setFichas,
    titulos,
    loading,
    updateFicha,
    deleteFicha,
  } = useFichas();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] =
    useState<Ficha | null>(null);

  const [editText, setEditText] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const paginatedData = useMemo(() => {
    let base = fichas;

    // 🌹 filtro da rota
    if (
      tipo === "vermelhas" ||
      tipo === "brancas"
    ) {
      base = base.filter(
        (f) =>
          obterCategoriaPorIdade(
            f.conteudo
          ) === tipo
      );
    }

    // 🔍 busca
    const q = search.toLowerCase().trim();

    if (q) {
      base = base.filter((f) =>
        f.conteudo
          .toLowerCase()
          .includes(q)
      );
    }

    const sorted = [...base].sort((a, b) =>
      extractFirstLine(
        a.conteudo
      ).localeCompare(
        extractFirstLine(
          b.conteudo
        ),
        "pt-BR"
      )
    );

    const totalPages = Math.ceil(
      sorted.length / ITEMS_PER_PAGE
    );

    const currentItems = sorted.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );

    const groups: Record<
      string,
      Ficha[]
    > = {};

    currentItems.forEach((ficha) => {
      const titulo =
        ficha.titulos?.titulo ||
        "Sem título";

      if (!groups[titulo]) {
        groups[titulo] = [];
      }

      groups[titulo].push(ficha);
    });

    return {
      groups,
      totalPages,
    };
  }, [
    fichas,
    search,
    page,
    tipo,
  ]);

  async function handleUpdate() {
    if (!selected) return;

    try {
      setSaving(true);

      const fichaAtualizada =
        await updateFicha(
          selected.id,
          editText,
          selected.titulos?.id ||
            null
        );

      setFichas((prev) =>
        prev.map((f) =>
          f.id === selected.id
            ? fichaAtualizada
            : f
        )
      );

      setSelected(null);
    } catch {
      alert(
        "Erro ao atualizar ficha"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: string
  ) {
    if (
      !confirm(
        "Deseja excluir essa ficha?"
      )
    ) {
      return;
    }

    try {
      await deleteFicha(id);

      setFichas((prev) =>
        prev.filter(
          (f) => f.id !== id
        )
      );
    } catch {
      alert(
        "Erro ao excluir ficha"
      );
    }
  }

  const tituloPagina =
    tipo === "vermelhas"
      ? "🌹 Rosas Vermelhas"
      : tipo === "brancas"
      ? "🤍 Rosas Brancas"
      : "Membros cadastrados";

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto">

        <MembrosHeader
          title={tituloPagina}
          subtitle="Arquivo vivo de todas as fichas enviadas"
          search={search}
          onSearchChange={setSearch}
        />

        {!loading &&
          Object.keys(
            paginatedData.groups
          ).length > 0 && (
            <div className="space-y-10">
              {Object.entries(
                paginatedData.groups
              ).map(
                ([titulo, lista]) => (
                  <section
                    key={titulo}
                  >
                    <h2 className="text-lg font-semibold mb-4 text-zinc-500">
                      {titulo}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {lista.map(
                        (ficha) => (
                          <FichaCard
                            key={
                              ficha.id
                            }
                            ficha={
                              ficha
                            }
                            onEdit={() => {
                              setSelected(
                                ficha
                              );

                              setEditText(
                                limparFormatacaoWhatsApp(
                                  ficha.conteudo
                                )
                              );
                            }}
                            onDelete={() =>
                              handleDelete(
                                ficha.id
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  </section>
                )
              )}

              <Pagination
                page={page}
                totalPages={
                  paginatedData.totalPages
                }
                onChange={setPage}
              />
            </div>
          )}

        {!loading &&
          Object.keys(
            paginatedData.groups
          ).length === 0 && (
            <div className="mt-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center text-gray-500">
              Nenhuma ficha encontrada.
            </div>
          )}
      </div>

      <FichaEditModal
        open={!!selected}
        ficha={selected}
        editText={editText}
        onEditTextChange={
          setEditText
        }
        titulos={titulos}
        saving={saving}
        onClose={() =>
          setSelected(null)
        }
        onSave={handleUpdate}
        onTituloChange={(
          tituloId
        ) => {
          const tituloSelecionado =
            titulos.find(
              (t) =>
                t.id ===
                tituloId
            );

          setSelected((prev) =>
            prev
              ? {
                  ...prev,
                  titulos:
                    tituloSelecionado,
                }
              : null
          );
        }}
        onRemoveTitulo={() =>
          setSelected((prev) =>
            prev
              ? {
                  ...prev,
                  titulos:
                    undefined,
                }
              : null
          )
        }
      />
    </main>
  );
}
