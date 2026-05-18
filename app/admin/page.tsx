"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabaseClient";

import type { User } from "@supabase/supabase-js";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type Textos = {
  apresentacao: string;
  ficha_feedback: string;
  ficha_conclusao: string;
  observacoes: string;
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

const DEFAULT_TEXTOS: Textos = {
  apresentacao: "",
  ficha_feedback: "",
  ficha_conclusao: "",
  observacoes: "",
};

const CAMPOS = [
  {
    key: "apresentacao",
    title: "🌹 Apresentação",
  },
  {
    key: "ficha_feedback",
    title: "🍀 Feedback",
  },
  {
    key: "ficha_conclusao",
    title: "📝 Conclusão",
  },
  {
    key: "observacoes",
    title: "📌 Observações",
  },
] as const;

/* ─────────────────────────────
   HOOK
──────────────────────────── */

function useAdminPanel() {
  const [user, setUser] = useState<User | null>(null);

  const [textos, setTextos] =
    useState<Textos>(DEFAULT_TEXTOS);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

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

  const loadData = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("admin_textos")
      .upsert(
        {
          user_id: userId,
          ...DEFAULT_TEXTOS,
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          updateStatus(
            "error",
            "Usuário não autenticado"
          );

          return;
        }

        setUser(user);

        const data = await loadData(user.id);

        if (!active) return;

        setTextos(data);
      } catch (err) {
        console.error(err);

        updateStatus(
          "error",
          "Erro ao carregar painel"
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const currentUser = session?.user;

        if (!active) return;

        if (!currentUser) {
          setUser(null);
          setTextos(DEFAULT_TEXTOS);

          updateStatus(
            "info",
            "Sessão encerrada"
          );

          return;
        }

        setUser(currentUser);

        const data = await loadData(currentUser.id);

        if (!active) return;

        setTextos(data);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadData, updateStatus]);

  const updateField = useCallback(
    (field: keyof Textos, value: string) => {
      setTextos((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const save = useCallback(async () => {
    if (!user || saving) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("admin_textos")
        .update({
          ...textos,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      updateStatus(
        "success",
        "Alterações salvas"
      );
    } catch (err) {
      console.error(err);

      updateStatus(
        "error",
        "Erro ao salvar alterações"
      );
    } finally {
      setSaving(false);
    }
  }, [saving, textos, updateStatus, user]);

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);

        updateStatus(
          "success",
          "Texto copiado"
        );
      } catch {
        updateStatus(
          "error",
          "Erro ao copiar"
        );
      }
    },
    [updateStatus]
  );

  return {
    textos,
    loading,
    saving,
    status,
    updateField,
    save,
    copy,
  };
}

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function AdminPage() {
  const {
    textos,
    loading,
    saving,
    status,
    updateField,
    save,
    copy,
  } = useAdminPanel();

  const fields = useMemo(
    () =>
      CAMPOS.map((campo) => ({
        ...campo,
        value: textos[campo.key],
      })),
    [textos]
  );

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">

        <Header />

        {status && (
          <Status
            type={status.type}
            message={status.message}
          />
        )}

        {loading ? (
          <Loading />
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2">
              {fields.map((field) => (
                <Field
                  key={field.key}
                  title={field.title}
                  value={field.value}
                  onChange={(value) =>
                    updateField(field.key, value)
                  }
                  onCopy={() =>
                    copy(field.value)
                  }
                />
              ))}
            </section>

            <SaveButton
              loading={saving}
              onClick={save}
            />
          </>
        )}
      </div>
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
        👑 Painel Administrativo
      </h1>

      <p className="text-sm text-zinc-400">
        Gerencie os textos do sistema
      </p>
    </header>
  );
});

function Loading() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-zinc-400">
      Carregando painel...
    </div>
  );
}

const Status = memo(function Status({
  type,
  message,
}: {
  type: "success" | "error" | "info";
  message: string;
}) {
  const styles = {
    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

    error:
      "border-red-500/20 bg-red-500/10 text-red-300",

    info:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}
    >
      {message}
    </div>
  );
});

const Field = memo(function Field({
  title,
  value,
  onChange,
  onCopy,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
}) {
  return (
    <article className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20">

      <div className="flex items-center justify-between">
        <h2 className="font-medium text-white/90">
          {title}
        </h2>

        <button
          onClick={onCopy}
          className="rounded-lg bg-white/10 px-3 py-1 text-xs transition hover:bg-white/20"
        >
          Copiar
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-44 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none transition focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20"
      />
    </article>
  );
});

const SaveButton = memo(function SaveButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-2xl bg-rose-600 py-3 font-semibold transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading
        ? "Salvando..."
        : "Salvar alterações"}
    </button>
  );
});
