"use client";

import { useState } from "react";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        senha: "",
    });

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro("");

        if (!form.email || !form.senha) {
            setErro("Preencha todos os campos.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    senha: form.senha,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErro(data?.error || "Erro ao fazer login.");
                return;
            }

            window.location.href = "/membros";

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

            {/* 🧊 Card */}
            <div className="relative w-full max-w-md">

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 blur-xl opacity-60" />

                <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-semibold text-white tracking-tight">
                            Bem-vindo
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Acesse sua conta
                        </p>
                    </div>

                    {erro && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg animate-pulse">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

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
                                className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 transition-all"
                            />
                        </div>

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
                                className="w-full bg-zinc-800/60 border border-zinc-700/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none rounded-lg px-4 py-2.5 pr-12 transition-all"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[34px] text-zinc-400 hover:text-white text-xs transition"
                            >
                                {showPassword ? "Ocultar" : "Ver"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden rounded-lg py-2.5 font-medium text-white transition-all
              bg-gradient-to-r from-rose-600 to-purple-600
              hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-500">
                        Não tem conta?{" "}
                        <a
                            href="/cadastrar"
                            className="text-rose-400 hover:text-rose-300 transition"
                        >
                            Criar conta
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
