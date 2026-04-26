"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const supabase = await createSupabaseServerClient();

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      }
    }

    checkUser();
  }, [router]);
}
