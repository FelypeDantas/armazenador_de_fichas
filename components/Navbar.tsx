"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ClipboardList,
  Trash2,
  Pencil,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────────
   CONFIG
──────────────────────────── */

const links = [
  { name: "Início", href: "/", icon: Home },
  { name: "Membros", href: "/membros", icon: Users },
  { name: "Grade", href: "/grade", icon: Settings },
  { name: "Admin", href: "/admin", icon: ClipboardList },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

/* ─────────────────────────────
   PROFILE SERVICE
──────────────────────────── */

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("admins")
    .select("nome, email, foto_url")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data;
}

/* ─────────────────────────────
   COMPONENT
──────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [ui, setUi] = useState({
    mobileOpen: false,
    dropdownOpen: false,
  });

  const [profile, setProfile] = useState({
    initial: "F",
    avatar: null as string | null,
    nome: "",
    email: "",
  });

  /* ─────────────────────────────
     PROFILE LOADER
  ───────────────────────────── */

  useEffect(() => {
    let alive = true;

    const loadProfile = async (userId: string) => {
      const data = await fetchProfile(userId);
      if (!alive || !data) return;

      setProfile({
        nome: data.nome ?? "",
        email: data.email ?? "",
        avatar: data.foto_url ?? null,
        initial: data.nome?.charAt(0).toUpperCase() ?? "F",
      });
    };

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) await loadProfile(user.id);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user;
        if (user) await loadProfile(user.id);
      }
    );

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ─────────────────────────────
     ACTIONS
  ───────────────────────────── */

  async function handleLogout() {
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const toggle = (key: keyof typeof ui) =>
    setUi((prev) => ({ ...prev, [key]: !prev[key] }));

  const isAuthPage = pathname === "/login" || pathname === "/cadastrar";
  if (isAuthPage) return null;

  /* ─────────────────────────────
     RENDER HELPERS
  ───────────────────────────── */

  const renderLink = (link: (typeof links)[0]) => {
    const Icon = link.icon;
    const active = pathname === link.href;

    return (
      <Link key={link.href} href={link.href}>
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            active
              ? "bg-rose-600/20 text-rose-400"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Icon size={18} />
          {link.name}
        </motion.div>
      </Link>
    );
  };

  /* ─────────────────────────────
     UI
  ───────────────────────────── */

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <div className="text-xl font-semibold text-white">
            🌹 Dark Roses
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(renderLink)}
          </div>

          {/* USER AREA */}
          <div className="hidden md:flex items-center gap-3 relative">

            <ThemeToggle>
              <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <Moon size={18} />
              </div>
            </ThemeToggle>

            <button
              onClick={() => toggle("dropdownOpen")}
              className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-700 flex items-center justify-center font-bold"
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.initial
              )}
            </button>

            <AnimatePresence>
              {ui.dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                >
                  <button className="w-full px-4 py-3 text-blue-400 hover:bg-white/5 flex gap-2">
                    <Pencil size={16} /> Editar Perfil
                  </button>

                  <button className="w-full px-4 py-3 text-red-400 hover:bg-white/5 flex gap-2">
                    <Trash2 size={16} /> Excluir Conta
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-red-400 hover:bg-white/5 flex gap-2"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => toggle("mobileOpen")}
            className="md:hidden p-2 text-white"
          >
            {ui.mobileOpen ? <X /> : <Menu />}
          </button>
        </nav>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {ui.mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed top-0 right-0 w-72 h-full bg-black/95 backdrop-blur-xl z-50 p-6 flex flex-col gap-4"
          >
            <div className="text-white text-lg mb-4">🌹 Menu</div>

            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => toggle("mobileOpen")}
              >
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300">
                  <link.icon size={18} />
                  {link.name}
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
