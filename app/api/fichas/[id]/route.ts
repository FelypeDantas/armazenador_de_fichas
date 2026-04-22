import { getSupabaseAdmin } from "@/lib/supabaseServer";

type Body = {
  conteudo?: unknown;
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

    const supabase = getSupabaseAdmin(); // 👑

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

    const { data, error } = await supabase
      .from("fichas")
      .update({ conteudo })
      .eq("id", id)
      .select()
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

// 🗑️ DELETE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 AQUI É A CHAVE

    console.log("DELETE ID:", id);

    if (!id) {
      return Response.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

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