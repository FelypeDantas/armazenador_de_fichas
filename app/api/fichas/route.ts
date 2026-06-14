import { createSupabaseServerClient } from "@/lib/supabaseServer";

/* ──────────────────────────────────────────
   CONFIG
────────────────────────────────────────── */

const ALLOWED_ORIGIN =
  "https://felypedantas.github.io";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":
    ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods":
    "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type",
};

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

type Body = {
  conteudo?: unknown;
  criado_por?: unknown;
  titulo_id?: unknown;
};

type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
};

/* ──────────────────────────────────────────
   RESPONSE HELPERS
────────────────────────────────────────── */

function jsonResponse<T>(
  body: ApiResponse<T>,
  status = 200
) {
  return Response.json(body, {
    status,
    headers: CORS_HEADERS,
  });
}

function success<T>(
  data: T,
  status = 200
) {
  return jsonResponse<T>(
    {
      success: true,
      data,
    },
    status
  );
}

function fail(
  error: string,
  status = 400,
  details?: unknown
) {
  const response: ApiResponse = {
    success: false,
    error,
  };

  if (details !== undefined) {
    response.details = details;
  }

  return jsonResponse(
    response,
    status
  );
}

/* ──────────────────────────────────────────
   VALIDATIONS
────────────────────────────────────────── */

function validarConteudo(
  value: unknown
): string {
  if (typeof value !== "string") {
    throw new Error(
      "Conteúdo inválido"
    );
  }

  const texto = value.trim();

  if (!texto) {
    throw new Error(
      "Conteúdo é obrigatório"
    );
  }

  if (texto.length < 3) {
    throw new Error(
      "Ficha muito curta"
    );
  }

  if (texto.length > 10_000) {
    throw new Error(
      "Ficha muito grande"
    );
  }

  return texto;
}

function validarTextoOpcional(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const texto = value.trim();

  return texto || null;
}

/* ──────────────────────────────────────────
   DATABASE HELPERS
────────────────────────────────────────── */

async function tituloExiste(
  supabase: Awaited<
    ReturnType<
      typeof createSupabaseServerClient
    >
  >,
  tituloId: string | null
) {
  if (!tituloId) {
    return true;
  }

  const { data, error } = await supabase
    .from("titulos")
    .select("id")
    .eq("id", tituloId)
    .maybeSingle();

  return !error && !!data;
}

/* ──────────────────────────────────────────
   OPTIONS
────────────────────────────────────────── */

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/* ──────────────────────────────────────────
   GET → LISTAR FICHAS
────────────────────────────────────────── */

export async function GET() {
  try {
    const supabase =
      await createSupabaseServerClient();

    const { data, error } = await supabase
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

    if (error) {
      console.error(
        "[FICHAS_GET_ERROR]",
        error
      );

      return fail(
        "Erro ao buscar fichas",
        500,
        error.message
      );
    }

    return success(data ?? []);
  } catch (error) {
    console.error(
      "[FICHAS_GET_FATAL]",
      error
    );

    return fail(
      "Erro interno no servidor",
      500
    );
  }
}

/* ──────────────────────────────────────────
   POST → CRIAR FICHA
────────────────────────────────────────── */

export async function POST(
  req: Request
) {
  try {
    let body: Body;

    try {
      body = await req.json();
    } catch {
      return fail(
        "JSON inválido"
      );
    }

    let conteudo: string;

    try {
      conteudo = validarConteudo(
        body.conteudo
      );
    } catch (error) {
      return fail(
        (error as Error).message
      );
    }

    const criado_por =
      validarTextoOpcional(
        body.criado_por
      );

    const titulo_id =
      validarTextoOpcional(
        body.titulo_id
      );

    const supabase =
      await createSupabaseServerClient();

    const tituloValido =
      await tituloExiste(
        supabase,
        titulo_id
      );

    if (!tituloValido) {
      return fail(
        "Título inválido"
      );
    }

    const { data, error } = await supabase
      .from("fichas")
      .insert({
        conteudo,
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
      console.error(
        "[FICHAS_POST_ERROR]",
        error
      );

      return fail(
        "Erro ao salvar ficha",
        500,
        error.message
      );
    }

    return success(
      data,
      201
    );
  } catch (error) {
    console.error(
      "[FICHAS_POST_FATAL]",
      error
    );

    return fail(
      "Erro interno no servidor",
      500
    );
  }
}
