"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Textos = {
  id?: string;
  apresentacao: string;
  ficha_feedback: string;
  ficha_conclusao: string;
  observacoes: string;
};

const defaultTextos: Textos = {
  apresentacao: "",
  ficha_feedback: "",
  ficha_conclusao: "",
  observacoes: "",
};

export default function AdminPage() {
  const [textos, setTextos] = useState<Textos>(defaultTextos);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 🧠 CARREGAMENTO CENTRALIZADO
  const carregar = async (u: User) => {
    try {
      setUser(u);

      const { data, error } = await supabase
        .from("admin_textos")
        .select("*")
        .eq("user_id", u.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTextos(data);
        return;
      }

      const { data: novo, error: insertError } = await supabase
        .from("admin_textos")
        .insert({
          user_id: u.id,
          ...defaultTextos,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (novo) setTextos(novo);
    } catch (err) {
      console.error(err);
      setMsg("❌ Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 INIT + AUTH LISTENER
  useEffect(() => {
    let active = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;

      if (!active) return;

      if (u) await carregar(u);
      else {
        setMsg("Usuário não autenticado");
        setLoading(false);
      }
    };

    init();

    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;

      if (u) carregar(u);
      else {
        setUser(null);
        setMsg("Sessão encerrada");
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // 💾 SALVAR
  const salvar = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setMsg(null);

      const { error } = await supabase
        .from("admin_textos")
        .update({
          ...textos,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setMsg("✅ Alterações salvas com sucesso");
    } catch (err) {
      console.error(err);
      setMsg("❌ Falha ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const atualizar = (campo: keyof Textos, valor: string) => {
    setTextos((prev) => ({ ...prev, [campo]: valor }));
  };

  const copiar = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setMsg("📋 Copiado para área de transferência");
    } catch {
      setMsg("❌ Não foi possível copiar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Carregando painel administrativo...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">👑 Painel Administrativo</h1>
        <p className="text-sm text-zinc-400">
          Gerencie os textos do sistema em tempo real
        </p>
      </div>

      {/* STATUS */}
      {msg && (
        <div className="bg-white/5 border border-white/10 text-zinc-300 px-4 py-2 rounded-xl text-sm">
          {msg}
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        <Field
          title="🌹 Apresentação"
          value={textos.apresentacao}
          onChange={(v) => atualizar("apresentacao", v)}
          onCopy={() => copiar(textos.apresentacao)}
        />

        <Field
          title="🍀 Feedback"
          value={textos.ficha_feedback}
          onChange={(v) => atualizar("ficha_feedback", v)}
          onCopy={() => copiar(textos.ficha_feedback)}
        />

        <Field
          title="📝 Conclusão"
          value={textos.ficha_conclusao}
          onChange={(v) => atualizar("ficha_conclusao", v)}
          onCopy={() => copiar(textos.ficha_conclusao)}
        />

        <Field
          title="📌 Observações"
          value={textos.observacoes}
          onChange={(v) => atualizar("observacoes", v)}
          onCopy={() => copiar(textos.observacoes)}
        />
      </div>

      {/* SAVE */}
      <button
        onClick={salvar}
        disabled={saving}
        className="w-full py-3 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
    </div>
  );
}

/* 🧩 FIELD COMPONENT (UI mais premium) */
function Field({
  title,
  value,
  onChange,
  onCopy,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onCopy: () => void;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/20 transition">

      <div className="flex items-center justify-between">
        <h2 className="font-medium text-white/90">{title}</h2>

        <button
          onClick={onCopy}
          className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          Copiar
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-40 resize-none bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
      />
    </div>
  );
}
