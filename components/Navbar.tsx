"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Users, Settings, Moon } from "lucide-react";

const links = [
  { name: "Início", href: "/", icon: Home },
  { name: "Membros", href: "/membros", icon: Users },
  { name: "Configurações", href: "/config", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold tracking-wide text-white"
        >
          🌹 Dark Roses
        </motion.div>

        {/* Links */}
        <div className="flex items-center gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-rose-600/20 text-rose-400 shadow-md shadow-rose-900/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden md:block">{link.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Ações (Dark Mode / Perfil futuramente) */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
            <Moon size={18} className="text-gray-300" />
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-700 flex items-center justify-center text-white font-bold">
            F
          </div>
        </div>
      </nav>
    </header>
  );
}