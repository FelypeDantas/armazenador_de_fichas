"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type Titulo = {
  id?: string;
  titulo: string;
  descricao: string;
};

type StatusVariant =
  | "success"
  | "error"
  | "info";

type StatusType = {
  type: StatusVariant;
  message: string;
} | null;

/* ─────────────────────────────
   CONSTANTS
──────────────────────────── */

const DEFAULT_FORM: Titulo = {
  titulo: "",
  descricao: "",
};

/* ─────────────────────────────
   HOOK
──────────────────────────── */

function useTitulos() {
  const [titulos, setTitulos] =
    useState<Titulo[]>([]);

  const [form, setForm] =
    useState<Titulo>(DEFAULT_FORM);

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  const [status, setStatus] =
    useState<StatusType>(null);

  const updateStatus = useCallback(
    (
      type: StatusVariant,
      message: string
    ) => {
      setStatus({ type, message });

      setTimeout(() => {
        setStatus(null);
      }, 3000);
    },
    []
  );

  const fetchTitulos = useCallback(async () => {
    try {
      setFetching(true);

      const { data, error } = await supabase
        .from("titulos")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setTitulos(data ?? []);
    } catch (err) {
      console.error(err);

      updateStatus(
        "error",
        "Erro ao carregar títulos"
      );
    } finally {
      setFetching(false);
    }
  }, [updateStatus]);

  useEffect(() => {
    fetchTitulos();
  }, [fetchTitulos]);

  const updateField = useCallback(
    (
      field: keyof Titulo,
      value: string
    ) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const createTitulo = useCallback(async () => {
    const titulo = form.titulo.trim();
    const descricao =
      form.descricao.trim();

    if (!titulo) {
      updateStatus(
        "info",
        "O título é obrigatório"
      );

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

      if (error) {
        throw error;
      }

      setTitulos((prev) => [
        data,
        ...prev,
      ]);

      setForm(DEFAULT_FORM);

      updateStatus(
        "success",
        "Título criado"
      );
    } catch (err) {
      console.error(err);

      updateStatus(
        "error",
        "Erro ao salvar título"
      );
    } finally {
      setLoading(false);
    }
  }, [form, updateStatus]);

  const deleteTitulo = useCallback(
    async (id: string) => {
      const previous = titulos;

      try {
        setTitulos((prev) =>
          prev.filter((t) => t.id !== id)
        );

        const { error } = await supabase
          .from("titulos")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }

        updateStatus(
          "success",
          "Título removido"
        );
      } catch (err) {
        console.error(err);

        setTitulos(previous);

        updateStatus(
          "error",
          "Erro ao excluir"
        );
      }
    },
    [titulos, updateStatus]
  );

  return {
    titulos,
    form,
    loading,
    fetching,
    status,
    updateField,
    createTitulo,
    deleteTitulo,
  };
}

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function TitulosPage() {
  const {
    titulos,
    form,
    loading,
    fetching,
    status,
    updateField,
    createTitulo,
    deleteTitulo,
  } = useTitulos();

  const hasTitulos = useMemo(
    () => titulos.length > 0,
    [titulos]
  );

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-8 px-6 py-10 text-white">

      <Header />

      {status && (
        <Status
          type={status.type}
          message={status.message}
        />
      )}

      <Form
        form={form}
        loading={loading}
        onChange={updateField}
        onSubmit={createTitulo}
      />

      <section className="space-y-4">
        {fetching ? (
          <Loading />
        ) : !hasTitulos ? (
          <Empty />
        ) : (
          titulos.map((titulo) => (
            <TituloCard
              key={titulo.id}
              titulo={titulo}
              onDelete={deleteTitulo}
            />
          ))
        )}
      </section>
    </main>
  );
}

/* ─────────────────────────────
   UI
──────────────────────────── */

const Header = memo(function Header() {
  return (
    <header className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">
        📌 Títulos
      </h1>

      <p className="text-sm text-zinc-400">
        Gerencie títulos e descrições
      </p>
    </header>
  );
});

const Status = memo(function Status({
  type,
  message,
}: {
  type: StatusVariant;
  message: string;
}) {
  const styles = {
    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

    error:
      "border-red-500/20 bg-red-500/10 text-red-300",

    info:
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}
    >
      {message}
    </div>
  );
});

const Form = memo(function Form({
  form,
  loading,
  onChange,
  onSubmit,
}: {
  form: Titulo;
  loading: boolean;
  onChange: (
    field: keyof Titulo,
    value: string
  ) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <input
        type="text"
        placeholder="Título"
        value={form.titulo}
        onChange={(e) =>
          onChange(
            "titulo",
            e.target.value
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black/40 p-3 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
      />

      <textarea
        placeholder="Descrição"
        value={form.descricao}
        onChange={(e) =>
          onChange(
            "descricao",
            e.target.value
          )
        }
        className="min-h-[140px] w-full rounded-xl border border-white/10 bg-black/40 p-3 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
      />

      <button
        onClick={onSubmit}
        disabled={loading}
        className="rounded-xl bg-purple-600 px-5 py-2 font-medium transition hover:bg-purple-700 disabled:opacity-50"
      >
        {loading
          ? "Salvando..."
          : "Salvar"}
      </button>
    </section>
  );
});

function Loading() {
  return (
    <p className="text-sm text-zinc-400">
      Carregando títulos...
    </p>
  );
}

function Empty() {
  return (
    <p className="text-sm text-zinc-500">
      Nenhum título cadastrado ainda.
    </p>
  );
}

const TituloCard = memo(function TituloCard({
  titulo,
  onDelete,
}: {
  titulo: Titulo;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900 p-5 transition hover:border-white/20">

      <h2 className="font-semibold">
        {titulo.titulo}
      </h2>

      {titulo.descricao && (
        <p className="mt-2 text-sm text-zinc-400">
          {titulo.descricao}
        </p>
      )}

      <button
        onClick={() =>
          onDelete(titulo.id!)
        }
        className="mt-4 text-xs text-red-400 transition hover:text-red-300"
      >
        Excluir
      </button>
    </article>
  );
});
