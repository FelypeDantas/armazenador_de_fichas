// lib/supabaseServer.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/* ─────────────────────────────
   CONFIG
──────────────────────────── */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env variables are missing.");
}

/* ─────────────────────────────
   FACTORY
──────────────────────────── */

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),

      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
