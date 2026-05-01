import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); 

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,

      set: (name, value, options) => {
        cookieStore.set({
          name,
          value,
          ...options,
        });
      },

      remove: (name, options) => {
        cookieStore.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });
}
