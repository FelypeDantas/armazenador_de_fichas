import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Ficha, Titulo, ApiResponse } from "@/types/fichas";

export function useFichas() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [fichasRes, titulosRes] = await Promise.allSettled([
          fetch("/api/fichas"),
          supabase
            .from("titulos")
            .select("id, titulo")
            .order("titulo"),
        ]);

        // FICHAS
        if (fichasRes.status === "fulfilled") {
          const res = fichasRes.value;

          const json: ApiResponse = await res
            .json()
            .catch(() => ({}));

          if (!res.ok) {
            throw new Error(
              json.error || "Erro ao buscar fichas"
            );
          }

          if (isMounted) {
            setFichas(
              Array.isArray(json.data)
                ? json.data
                : []
            );
          }
        }

        // TITULOS
        if (titulosRes.status === "fulfilled") {
          const { data, error } = titulosRes.value;

          if (error) {
            console.error(
              "Erro ao buscar títulos:",
              error
            );
          } else if (isMounted) {
            setTitulos(data || []);
          }
        }
      } catch (err) {
        console.error(err);

        if (isMounted) {
          setError(
            "Não foi possível carregar os dados."
          );
          setFichas([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    fichas,
    setFichas,
    titulos,
    loading,
    error,
  };
}