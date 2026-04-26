import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Body = {
  conteudo?: unknown;
  criado_por?: string | null;
};

// 📥 GET → listar fichas
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("fichas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET fichas error:", error);

      return Response.json(
        { error: "Erro ao buscar fichas", details: error.message },
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

// 📤 POST → criar ficha
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

    const conteudo =
      typeof body?.conteudo === "string"
        ? body.conteudo.trim()
        : "";

    if (!conteudo) {
      return Response.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      );
    }

    if (conteudo.length < 3) {
      return Response.json(
        { error: "Ficha muito curta" },
        { status: 400 }
      );
    }

    if (conteudo.length > 10000) {
      return Response.json(
        { error: "Ficha muito grande" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("fichas")
      .insert({
        conteudo,
        criado_por: body?.criado_por ?? null,
      })
      .select()
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
