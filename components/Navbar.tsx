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
  Pencil
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

async function getProfile(userId: string) {
  const { data } = await supabase
    .from("admins")
    .select("nome, email, foto_url")
    .eq("user_id", userId)
    .single();

  return data;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [initial, setInitial] = useState("F");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // 🔥 novos estados
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async (userId: string) => {
      const profile = await getProfile(userId);

      if (!mounted) return;

      const name = profile?.nome || "";
      const foto = profile?.foto_url || null;

      setInitial(name ? name.charAt(0).toUpperCase() : "F");
      setNome(name);
      setEmail(profile?.email || "");

      // 🔥 chave final contra "sumir imagem"
      setAvatar(foto || null);
    };

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setAvatar(null);
        return;
      }

      await load(user.id);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user;

        if (!user) {
          setAvatar(null);
          return;
        }

        await load(user.id);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleDeleteUser() {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação é irreversível."
    );

    if (!confirmDelete) return;

    const res = await fetch("/api/user/delete", {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success) {
      await handleLogout();
    } else {
      alert("Erro ao excluir conta");
    }
  }

  // 🔥 upload imagem
  async function uploadAvatar(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // 🔥 salvar perfil
  async function handleUpdate() {
    try {
      setLoading(true);

      let fotoUrl = avatar;

      if (file) {
        fotoUrl = await uploadAvatar(file);
      }

      const token = localStorage.getItem("token");

      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          foto_url: fotoUrl,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAvatar(fotoUrl || null);
        setEditOpen(false);
        setFile(null);
        setPreview(null);
        setSenha("");
        alert("Perfil atualizado!");
      } else {
        alert("Erro ao atualizar");
      }
    } catch (err) {
      console.error(err);
      alert("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (pathname === "/login" || pathname === "/cadastrar") {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="text-xl font-semibold text-white">
            🌹 Dark Roses
          </div>

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

          <div className="hidden md:flex items-center gap-3 relative">
            <ThemeToggle>
              <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <Moon size={18} className="text-gray-300" />
              </div>
            </ThemeToggle>

            <div className="relative">
              <button
                onClick={() => setDropdown(!dropdown)}
                className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-700 flex items-center justify-center text-white font-bold"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                  <img src={avatar} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </button>

              <AnimatePresence>
                {dropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                  >

                    <button
                      onClick={() => setEditOpen(true)}
                      className="w-full flex items-center gap-2 px-4 py-3 text-blue-400 hover:bg-white/5"
                    >
                      <Pencil size={16} />
                      Editar Perfil
                    </button>

                    <button
                      onClick={handleDeleteUser}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-white/5"
                    >
                      <Trash2 size={16} />
                      Excluir Conta
                    </button>

                    <div className="border-t border-white/10" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-white/5"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            {open ? <X /> : <Menu />}
          </button>
        </nav>
      </header>

      {/* 🔥 MODAL COMPLETO */}
      <AnimatePresence>
        {editOpen && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md">

              <h2 className="text-white mb-4">Editar Perfil</h2>

              {/* preview */}
              {(preview || avatar) && (
                // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                <img
                  src={preview || avatar!}
                  className="w-20 h-20 rounded-full object-cover mb-4"
                />
              )}

              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full mb-2 p-2 bg-black/40 rounded"
                placeholder="Nome"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-2 p-2 bg-black/40 rounded"
                placeholder="Email"
              />

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full mb-2 p-2 bg-black/40 rounded"
                placeholder="Nova senha"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }}
                className="mb-4"
              />

              <div className="flex justify-end gap-2">
                <button onClick={() => setEditOpen(false)}>Cancelar</button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-rose-600 px-4 py-2 rounded text-white"
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
