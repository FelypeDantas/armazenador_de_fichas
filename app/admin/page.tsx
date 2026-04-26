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
  const [mensagem, setMensagem] = useState("");

  // 🚀 INIT com listener de sessão (melhor abordagem)
  useEffect(() => {
    const carregar = async (user: User) => {
      try {
        setUser(user);

        const { data, error } = await supabase
          .from("admin_textos")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          setTextos(data[0]);
        } else {
          const { data: novo, error: insertError } = await supabase
            .from("admin_textos")
            .insert({
              user_id: user.id,
              ...defaultTextos,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          if (novo) setTextos(novo);
        }
      } catch (err) {
        console.error(err);
        setMensagem("❌ Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    const iniciar = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await carregar(session.user);
      } else {
        setMensagem("Usuário não autenticado.");
        setLoading(false);
      }
    };

    iniciar();

    // 👀 Escuta mudanças de login/logout automaticamente
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          carregar(session.user);
        } else {
          setUser(null);
          setMensagem("Sessão encerrada.");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 💾 SALVAR
  const salvar = async () => {
    if (!user) {
      setMensagem("Usuário não autenticado.");
      return;
    }

    try {
      setSaving(true);
      setMensagem("");

      const { error } = await supabase
        .from("admin_textos")
        .update({
          apresentacao: textos.apresentacao,
          ficha_feedback: textos.ficha_feedback,
          ficha_conclusao: textos.ficha_conclusao,
          observacoes: textos.observacoes,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setMensagem("✅ Salvo com sucesso!");
    } catch (err) {
      console.error(err);
      setMensagem("❌ Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  // ✏️ Atualizar campo
  const atualizarCampo = (campo: keyof Textos, valor: string) => {
    setTextos((prev) => ({ ...prev, [campo]: valor }));
  };

  // 📋 Copiar
  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setMensagem("📋 Copiado!");
    } catch {
      setMensagem("❌ Erro ao copiar.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-zinc-400">
        Carregando painel do ADM...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">👑 Painel do ADM</h1>

      {mensagem && (
        <div className="bg-zinc-800 p-3 rounded text-sm text-center">
          {mensagem}
        </div>
      )}

      <Section
        titulo="🌹 Apresentação"
        valor={textos.apresentacao}
        onChange={(v) => atualizarCampo("apresentacao", v)}
        onCopy={() => copiar(textos.apresentacao)}
      />

      <Section
        titulo="🍀 Ficha de Feedback"
        valor={textos.ficha_feedback}
        onChange={(v) => atualizarCampo("ficha_feedback", v)}
        onCopy={() => copiar(textos.ficha_feedback)}
      />

      <Section
        titulo="📝 Ficha de Conclusão"
        valor={textos.ficha_conclusao}
        onChange={(v) => atualizarCampo("ficha_conclusao", v)}
        onCopy={() => copiar(textos.ficha_conclusao)}
      />

      <Section
        titulo="📌 Observações"
        valor={textos.observacoes}
        onChange={(v) => atualizarCampo("observacoes", v)}
        onCopy={() => copiar(textos.observacoes)}
      />

      <button
        onClick={salvar}
        disabled={saving}
        className="w-full bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded font-semibold disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar tudo"}
      </button>
    </div>
  );
}

// 🧩 COMPONENTE
function Section({
  titulo,
  valor,
  onChange,
  onCopy,
}: {
  titulo: string;
  valor: string;
  onChange: (v: string) => void;
  onCopy: () => void;
}) {
  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{titulo}</h2>

        <button
          onClick={onCopy}
          className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          Copiar
        </button>
      </div>

      <textarea
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-40 p-3 bg-zinc-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Digite aqui..."
      />
    </div>
  );
}