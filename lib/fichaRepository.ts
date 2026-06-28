import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { limparFormatacaoWhatsApp } from "@/lib/fichaUtils";

export async function tituloExiste(
  tituloId: string | null
) {
  if (!tituloId) {
    return true;
  }

  const supabase =
    await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("titulos")
    .select("id")
    .eq("id", tituloId)
    .maybeSingle();

  return !error && !!data;
}

export async function listarFichas() {
  const supabase =
    await createSupabaseServerClient();

  return supabase
    .from("fichas")
    .select(`
      id,
      conteudo,
      created_at,
      criado_por,
      titulos (
        id,
        titulo
      )
    `)
    .order("created_at", {
      ascending: false,
    });
}

type CriarFichaParams = {
  conteudo: string;
  criado_por: string | null;
  titulo_id: string | null;
};

export async function criarFicha({
  conteudo,
  criado_por,
  titulo_id,
}: CriarFichaParams) {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("fichas")
    .insert({
      conteudo: limparFormatacaoWhatsApp(conteudo),
      criado_por,
      titulo_id,
    })
    .select(`
      id,
      conteudo,
      created_at,
      criado_por,
      titulos (
        id,
        titulo
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function atualizarFicha(
  id: string,
  conteudo: string,
  titulo_id: string | null
) {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("fichas")
    .update({
      conteudo,
      titulo_id,
    })
    .eq("id", id)
    .select(`
      id,
      conteudo,
      created_at,
      titulos (
        id,
        titulo
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function removerFicha(
  id: string
) {
  const supabase =
    await createSupabaseServerClient();

  const { error } = await supabase
    .from("fichas")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
