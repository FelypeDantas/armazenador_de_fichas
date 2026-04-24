"use client";

import { useState } from "react";

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!form.nome || !form.email || !form.senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
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
          nome: form.nome,
          email: form.email,
          senha: form.senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao cadastrar.");
        return;
      }

      setSucesso("Conta criada com sucesso! 🎉");
      setForm({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
      });
    } catch {
      setErro("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
      
      {/* 🌌 Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-rose-600/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      <div className="relative w-full max-w-md">
        
        {/* Glow border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 blur-xl opacity-60" />

        <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-white">
              Criar conta
            </h1>
            <p className="text-zinc-400 text-sm">
              Comece sua jornada no sistema
            </p>
          </div>

          {/* Feedback */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nome */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">
                Nome
              </label>
              <input
                name="nome"
                placeholder="Seu nome"
                value={form.nome}
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 transition"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 transition"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1 relative">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">
                Senha
              </label>
              <input
                name="senha"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 pr-12 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-zinc-400 hover:text-white text-xs"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">
                Confirmar senha
              </label>
              <input
                name="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={form.confirmarSenha}
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 transition"
              />
            </div>

            {/* Botão */}
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

          {/* Footer */}
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