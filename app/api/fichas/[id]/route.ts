import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Body = {
  conteudo?: unknown;
  titulo_id?: string | null; // ✅ NOVO
};

// ✏️ UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const conteudo =
      typeof body.conteudo === "string"
        ? body.conteudo.trim()
        : "";

    if (!conteudo) {
      return Response.json(
        { error: "Conteúdo obrigatório" },
        { status: 400 }
      );
    }

    const titulo_id =
      typeof body.titulo_id === "string" && body.titulo_id
        ? body.titulo_id
        : null;

    /* 🛡️ valida se o título existe (somente se vier) */
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
      .update({
        conteudo,
        titulo_id, // ✅ NOVO
      })
      .eq("id", id)
      .select(`
        *,
        titulos (
          id,
          titulo
        )
      `) // ✅ já retorna com título
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
    console.error("PUT error:", err);

    return Response.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE (inalterado)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    console.log("DELETE ID:", id);

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
      deleted: data,
    });

  } catch (err) {
    console.error("DELETE fatal:", err);

    return Response.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
