"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type FormData = {
  email: string;
  senha: string;
};

const defaultForm: FormData = {
  email: "",
  senha: "",
};

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  /* ─────────────────────────────
     HANDLERS
  ───────────────────────────── */

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const validate = () => {
    if (!form.email || !form.senha) {
      return "Preencha todos os campos.";
    }

    if (!form.email.includes("@")) {
      return "Email inválido.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const validationError = validate();
    if (validationError) {
      setErro(validationError);
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.senha,
      });

      if (error) throw error;

      // ✅ navegação correta
      router.replace("/membros");

    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────
     UI
  ───────────────────────────── */

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">

      <Background />

      <div className="relative w-full max-w-md">
        <GlowCard>

          <Header />

          {erro && <ErrorBox message={erro} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
            />

            <PasswordInput
              label="Senha"
              name="senha"
              value={form.senha}
              show={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
              onChange={handleChange}
            />

            <SubmitButton loading={loading} />
          </form>

          <Footer />

        </GlowCard>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   UI PARTS
──────────────────────────── */

function Background() {
  return (
    <>
      <div className="absolute w-[500px] h-[500px] bg-rose-600/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
    </>
  );
}

function GlowCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 blur-xl opacity-60" />

      <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-semibold text-white tracking-tight">
        Bem-vindo
      </h1>
      <p className="text-zinc-400 text-sm">
        Acesse sua conta
      </p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
      {message}
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-400 uppercase tracking-wider">
        {label}
      </label>

      <input
        {...props}
        className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 transition"
      />
    </div>
  );
}

function PasswordInput({
  label,
  name,
  value,
  show,
  onToggle,
  onChange,
}: any) {
  return (
    <div className="space-y-1 relative">
      <label className="text-xs text-zinc-400 uppercase tracking-wider">
        {label}
      </label>

      <input
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 pr-12 transition"
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-[34px] text-zinc-400 hover:text-white text-xs"
      >
        {show ? "Ocultar" : "Ver"}
      </button>
    </div>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg py-2.5 font-medium text-white
      bg-gradient-to-r from-rose-600 to-purple-600
      hover:brightness-110 active:scale-[0.98]
      transition disabled:opacity-50"
    >
      {loading ? "Entrando..." : "Entrar"}
    </button>
  );
}

function Footer() {
  return (
    <p className="text-center text-sm text-zinc-500">
      Não tem conta?{" "}
      <a
        href="/cadastrar"
        className="text-rose-400 hover:text-rose-300 transition"
      >
        Criar conta
      </a>
    </p>
  );
}
