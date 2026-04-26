"use client";

import Link from "next/link";
import { usePathname, useRouter} from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Settings,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ClipboardList
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const links = [
  { name: "Início", href: "/", icon: Home },
  { name: "Membros", href: "/membros", icon: Users },
  { name: "Grade", href: "/grade", icon: Settings },
  { name: "Admin", href: "/admin", icon: ClipboardList },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [initial, setInitial] = useState("F");

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();

      const name =
        data?.user?.user_metadata?.name ||
        data?.user?.email ||
        "";

      if (name) {
        setInitial(name.charAt(0).toUpperCase());
      }
    }

    getUser();
  }, []);

  const router = useRouter();

  async function handleLogout() {
    try {
      // 🔥 limpa sessão no client
      await supabase.auth.signOut();

      // 🔥 limpa sessão no server (cookies)
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // 🚀 redireciona
      router.push("/login");
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  }

  if (pathname === "/login" || pathname === "/cadastrar") {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="text-xl font-semibold text-white">
          🌹 Dark Roses
        </div>

        {/* Links Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition
                  ${isActive
                      ? "bg-rose-600/20 text-rose-400"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon size={18} />
                  {link.name}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Ações Desktop */}
        <div className="hidden md:flex items-center gap-3 relative">
          <ThemeToggle>
            <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
              <Moon size={18} className="text-gray-300" />
            </div>
          </ThemeToggle>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setDropdown(!dropdown)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-700 flex items-center justify-center text-white font-bold"
            >
              {initial}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {dropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Botão Mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Menu Mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden px-6 pb-6"
          >
            <div className="flex flex-col gap-3 mt-4 bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10">

              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                      ${isActive
                          ? "bg-rose-600/20 text-rose-400"
                          : "text-gray-300 hover:bg-white/5"
                        }`}
                    >
                      <Icon size={18} />
                      {link.name}
                    </div>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-t border-white/10 my-2" />

              {/* Ações Mobile */}
              <div className="flex items-center justify-between">
                <ThemeToggle>
                  <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                    <Moon size={18} className="text-gray-300" />
                  </div>
                </ThemeToggle>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
