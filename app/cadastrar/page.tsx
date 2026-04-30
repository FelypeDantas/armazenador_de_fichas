"use client";

import { useState, useCallback } from "react";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type FormData = {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
};

const defaultForm: FormData = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};

/* ─────────────────────────────
   PAGE
──────────────────────────── */

export default function Cadastro() {
  const [form, setForm] = useState<FormData>(defaultForm);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  /* ─────────────────────────────
     HELPERS
  ───────────────────────────── */

  const resetMessages = () => {
    setErro(null);
    setSucesso(null);
  };

  const setError = (msg: string) => {
    setErro(msg);
    setSucesso(null);
  };

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

  /* ─────────────────────────────
     VALIDATION
  ───────────────────────────── */

  const validate = () => {
    if (!form.nome || !form.email || !form.senha) {
      return "Preencha todos os campos.";
    }

    if (form.senha.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    if (form.senha !== form.confirmarSenha) {
      return "As senhas não coincidem.";
    }

    return null;
  };

  /* ─────────────────────────────
     SUBMIT
  ───────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          senha: form.senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar.");
      }

      setSucesso("Conta criada com sucesso! 🎉");
      setForm(defaultForm);
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────
     UI
  ───────────────────────────── */

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">

      {/* 🌌 Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-rose-600/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      <div className="relative w-full max-w-md">

        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 blur-xl opacity-60" />

        <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">

          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-white">
              Criar conta
            </h1>
            <p className="text-zinc-400 text-sm">
              Comece sua jornada no sistema
            </p>
          </div>

          {/* FEEDBACK */}
          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded-lg">
              {sucesso}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <Input label="Nome" name="nome" value={form.nome} onChange={handleChange} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />

            <PasswordInput
              label="Senha"
              name="senha"
              value={form.senha}
              show={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
              onChange={handleChange}
            />

            <Input
              label="Confirmar senha"
              name="confirmarSenha"
              type="password"
              value={form.confirmarSenha}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 font-medium text-white
              bg-gradient-to-r from-rose-600 to-purple-600
              hover:brightness-110 active:scale-[0.98]
              transition disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Já tem conta?{" "}
            <a href="/login" className="text-rose-400 hover:text-rose-300">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   INPUT COMPONENT
──────────────────────────── */

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 transition"
      />
    </div>
  );
}

/* ─────────────────────────────
   PASSWORD INPUT
──────────────────────────── */

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
