import { createSupabaseServerClient } from "@/lib/supabaseServer";

/* ─────────────────────────────
   CORS
──────────────────────────── */

const ALLOWED_ORIGIN =
  "https://felypedantas.github.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods":
    "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type",
};

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type Body = {
  conteudo?: unknown;
  criado_por?: string | null;
  titulo_id?: string | null;
};

/* ─────────────────────────────
   RESPONSE HELPERS
──────────────────────────── */

function success(data: unknown, status = 200) {
  return Response.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers: corsHeaders,
    }
  );
}

function fail(
  error: string,
  status = 400,
  details?: unknown
) {
  return Response.json(
    {
      success: false,
      error,
      ...(details ? { details } : {}),
    },
    {
      status,
      headers: corsHeaders,
    }
  );
}

/* ─────────────────────────────
   OPTIONS (CORS PREFLIGHT)
──────────────────────────── */

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/* ─────────────────────────────
   VALIDATIONS
──────────────────────────── */

function validarConteudo(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Conteúdo inválido");
  }

  const texto = value.trim();

  if (!texto) {
    throw new Error("Conteúdo é obrigatório");
  }

  if (texto.length < 3) {
    throw new Error("Ficha muito curta");
  }

  if (texto.length > 10000) {
    throw new Error("Ficha muito grande");
  }

  return texto;
}

function validarTituloId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const texto = value.trim();

  return texto || null;
}

/* ─────────────────────────────
   DATABASE HELPERS
──────────────────────────── */

async function buscarTitulo(
  supabase: Awaited<
    ReturnType<typeof createSupabaseServerClient>
  >,
  titulo_id: string
) {
  const { data, error } = await supabase
    .from("titulos")
    .select("id")
    .eq("id", titulo_id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/* ─────────────────────────────
   GET → listar fichas
──────────────────────────── */

export async function GET() {
  try {
    const supabase =
      await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("fichas")
      .select(`
        *,
        titulos (
          id,
          titulo
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("GET fichas:", error);

      return fail(
        "Erro ao buscar fichas",
        400,
        error.message
      );
    }

    return success(data ?? []);

  } catch (err) {
    console.error("GET fatal:", err);

    return fail(
      "Erro interno no servidor",
      500
    );
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
      return fail("JSON inválido");
    }

    let conteudo: string;

    try {
      conteudo = validarConteudo(
        body.conteudo
      );
    } catch (err: any) {
      return fail(err.message);
    }

    const titulo_id =
      validarTituloId(body.titulo_id);

    const criado_por =
      typeof body.criado_por === "string"
        ? body.criado_por.trim() || null
        : null;

    const supabase =
      await createSupabaseServerClient();

    /* VALIDAR TÍTULO */

    if (titulo_id) {
      const tituloExiste =
        await buscarTitulo(
          supabase,
          titulo_id
        );

      if (!tituloExiste) {
        return fail("Título inválido");
      }
    }

    /* INSERT */

    const { data, error } = await supabase
      .from("fichas")
      .insert({
        conteudo,
        criado_por,
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

      return fail(
        "Erro ao salvar no banco",
        400,
        error.message
      );
    }

    return success(data, 201);

  } catch (err) {
    console.error("POST fatal:", err);

    return fail(
      "Erro interno no servidor",
      500
    );
  }
}
