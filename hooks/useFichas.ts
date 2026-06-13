import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Ficha,
  Titulo,
  ApiResponse,
} from "@/types/fichas";

export function useFichas() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [fichasRes, titulosRes] =
        await Promise.all([
          fetch("/api/fichas"),
          supabase
            .from("titulos")
            .select("id, titulo")
            .order("titulo"),
        ]);

      // FICHAS
      const fichasJson: ApiResponse =
        await fichasRes.json();

      if (!fichasRes.ok) {
        throw new Error(
          fichasJson.error ||
            "Erro ao buscar fichas"
        );
      }

      setFichas(
        Array.isArray(fichasJson.data)
          ? fichasJson.data
          : []
      );

      // TITULOS
      const {
        data: titulosData,
        error: titulosError,
      } = await titulosRes;

      if (titulosError) {
        throw titulosError;
      }

      setTitulos(titulosData || []);
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível carregar os dados."
      );

      setFichas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function updateFicha(
    id: string,
    conteudo: string,
    tituloId: string | null
  ) {
    const res = await fetch(`/api/fichas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conteudo,
        titulo_id: tituloId,
      }),
    });

    const json = await res
      .json()
      .catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        json.error || "Erro ao atualizar ficha"
      );
    }

    return json.data as Ficha;
  }

  async function deleteFicha(id: string) {
    const res = await fetch(`/api/fichas/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(
        "Erro ao excluir ficha"
      );
    }
  }

  return {
    fichas,
    setFichas,

    titulos,

    loading,
    error,

    reload: loadData,

    updateFicha,
    deleteFicha,
  };
}
