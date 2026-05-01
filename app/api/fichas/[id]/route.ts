import { createSupabaseServerClient } from "@/lib/supabaseServer";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

type Body = {
  conteudo?: unknown;
  titulo_id?: string | null;
};

type Params = {
  params: Promise<{ id: string }>;
};

/* ─────────────────────────────────────────────
   🧪 VALIDADORES
───────────────────────────────────────────── */

function validarConteudo(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const texto = value.trim();

  if (!texto) return null;
  if (texto.length < 3) return "Ficha muito curta";
  if (texto.length > 10000) return "Ficha muito grande";

  return texto;
}

async function validarTitulo(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  titulo_id: string | null
) {
  if (!titulo_id) return true;

  const { data, error } = await supabase
    .from("titulos")
    .select("id")
    .eq("id", titulo_id)
    .maybeSingle();

  return !error && !!data;
}

/* ─────────────────────────────────────────────
   ✏️ UPDATE
───────────────────────────────────────────── */

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    let body: Body;

    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "JSON inválido" },
        { status: 400 }
      );
    }

    /* 🧠 valida conteúdo */
    const conteudo = validarConteudo(body.conteudo);

    if (!conteudo) {
      return Response.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      );
    }

    if (conteudo === "Ficha muito curta" || conteudo === "Ficha muito grande") {
      return Response.json({ error: conteudo }, { status: 400 });
    }

    /* 🎯 trata título */
    const titulo_id =
      typeof body.titulo_id === "string" && body.titulo_id
        ? body.titulo_id
        : null;

    const tituloValido = await validarTitulo(supabase, titulo_id);

    if (!tituloValido) {
      return Response.json(
        { error: "Título inválido" },
        { status: 400 }
      );
    }

    /* 💾 update */
    const { data, error } = await supabase
      .from("fichas")
      .update({
        conteudo,
        titulo_id,
      })
      .eq("id", id)
      .select(`
        *,
        titulos (
          id,
          titulo
        )
      `)
      .single();

    if (error) {
      console.error("Update error:", error);

      return Response.json(
        {
          error: "Erro ao atualizar ficha",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("PUT fatal:", err);

    return Response.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   🗑️ DELETE
───────────────────────────────────────────── */

export async function DELETE(
  _req: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("fichas")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("Delete error:", error);

      return Response.json(
        {
          error: "Erro ao deletar ficha",
          details: error.message,
        },
        { status: 400 }
      );
    }

    if (!data || data.length === 0) {
      return Response.json(
        { error: "Ficha não encontrada" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      deleted: data[0],
    });

  } catch (err) {
    console.error("DELETE fatal:", err);

    return Response.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
