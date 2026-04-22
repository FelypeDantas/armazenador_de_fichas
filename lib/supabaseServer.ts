import { createClient } from "@supabase/supabase-js";

/**
 * 👑 CLIENTE ADMIN (SERVICE ROLE)
 * - Ignora RLS
 * - Acesso total ao banco
 * - USAR APENAS NO BACKEND (/api)
 */
export function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false, // 👈 importante no server
      },
    }
  );
}