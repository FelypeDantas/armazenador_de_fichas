import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Body = {
  conteudo?: unknown;
  criado_por?: string | null;
  titulo_id?: string | null;
};

/* ─────────────────────────────────────────────
   🧪 VALIDADORES
───────────────────────────────────────────── */
function validarConteudo(value: unknown) {
  if (typeof value !== "string") return null;

  const texto = value.trim();

  if (!texto) return null;
  if (texto.length < 3) return "Ficha muito curta";
  if (texto.length > 10000) return "Ficha muito grande";

  return texto;
}

/* ─────────────────────────────────────────────
   📥 GET → listar fichas (COM TÍTULO)
───────────────────────────────────────────── */
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
      console.error("GET fichas error:", error);

      return Response.json(
        {
          error: "Erro ao buscar fichas",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      data: data ?? [],
    });
  } catch (error) {
    console.error("GET fatal error:", error);

    return Response.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   📤 POST → criar ficha (COM título opcional)
───────────────────────────────────────────── */
export async function POST(req: Request) {
  try {
    let body: Body;

    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "JSON inválido" },
        { status: 400 }
      );
    }

    const conteudo = validarConteudo(body?.conteudo);

    if (!conteudo) {
      return Response.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      );
    }

    if (typeof conteudo === "string" && conteudo.length < 3) {
      return Response.json(
        { error: "Ficha muito curta" },
        { status: 400 }
      );
    }

    if (typeof conteudo === "string" && conteudo.length > 10000) {
      return Response.json(
        { error: "Ficha muito grande" },
        { status: 400 }
      );
    }

    const titulo_id =
      typeof body?.titulo_id === "string" && body.titulo_id
        ? body.titulo_id
        : null;

    const supabase = await createSupabaseServerClient();

    /* 🛡️ valida se o título existe */
    if (titulo_id) {
      const { data: tituloExiste, error: tituloError } = await supabase
        .from("titulos")
        .select("id")
        .eq("id", titulo_id)
        .single();

      if (tituloError || !tituloExiste) {
        return Response.json(
          { error: "Título inválido" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("fichas")
      .insert({
        conteudo,
        criado_por: body?.criado_por ?? null,
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
      console.error("POST fichas error:", error);

      return Response.json(
        {
          error: "Erro ao salvar no banco",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("POST fatal error:", error);

    return Response.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
