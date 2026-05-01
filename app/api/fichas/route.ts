import { createSupabaseServerClient } from "@/lib/supabaseServer";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type Body = {
  conteudo?: unknown;
  criado_por?: string | null;
  titulo_id?: string | null;
};

/* ─────────────────────────────
   HELPERS
──────────────────────────── */

const json = (data: unknown, status = 200) =>
  Response.json(data, { status });

function validarConteudo(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const texto = value.trim();

  if (!texto) return null;
  if (texto.length < 3) throw new Error("Ficha muito curta");
  if (texto.length > 10000) throw new Error("Ficha muito grande");

  return texto;
}

/* ─────────────────────────────
   GET → listar fichas
──────────────────────────── */

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("fichas")
      .select(`
        *,
        titulos (
          id,
          titulo
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET fichas:", error);
      return json(
        { error: "Erro ao buscar fichas", details: error.message },
        400
      );
    }

    return json({ success: true, data: data ?? [] });

  } catch (err) {
    console.error("GET fatal:", err);
    return json({ error: "Erro interno no servidor" }, 500);
  }
}

/* ─────────────────────────────
   POST → criar ficha
──────────────────────────── */

export async function POST(req: Request) {
  try {
    let body: Body;

    try {
      body = await req.json();
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }

    /* ─────────────────────────────
       VALIDATION
    ───────────────────────────── */

    let conteudo: string;

    try {
      const valid = validarConteudo(body.conteudo);
      if (!valid) throw new Error("Conteúdo é obrigatório");
      conteudo = valid;
    } catch (err: any) {
      return json({ error: err.message }, 400);
    }

    const titulo_id =
      typeof body.titulo_id === "string" && body.titulo_id
        ? body.titulo_id
        : null;

    const supabase = await createSupabaseServerClient();

    /* ─────────────────────────────
       VALIDAR TÍTULO
    ───────────────────────────── */

    if (titulo_id) {
      const { data, error } = await supabase
        .from("titulos")
        .select("id")
        .eq("id", titulo_id)
        .maybeSingle();

      if (error || !data) {
        return json({ error: "Título inválido" }, 400);
      }
    }

    /* ─────────────────────────────
       INSERT
    ───────────────────────────── */

    const { data, error } = await supabase
      .from("fichas")
      .insert({
        conteudo,
        criado_por: body.criado_por ?? null,
        titulo_id,
      })
      .select(`
        *,
        titulos (
          id,
          titulo
        )
      `)
      .single();

    if (error) {
      console.error("POST fichas:", error);
      return json(
        { error: "Erro ao salvar no banco", details: error.message },
        400
      );
    }

    return json({ success: true, data });

  } catch (err) {
    console.error("POST fatal:", err);
    return json({ error: "Erro interno no servidor" }, 500);
  }
}
