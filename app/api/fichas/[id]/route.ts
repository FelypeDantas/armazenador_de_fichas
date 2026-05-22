import { createSupabaseServerClient } from "@/lib/supabaseServer";

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

type Body = {
  conteudo?: unknown;
  titulo_id?: unknown;
};

type Params = {
  params: Promise<{
    id: string;
  }>;
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
   PUT → UPDATE FICHA
────────────────────────────────────────── */

export async function PUT(
  req: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return fail(
        "ID inválido"
      );
    }

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
      console.error(
        "[FICHAS_PUT_ERROR]",
        error
      );

      return fail(
        "Erro ao atualizar ficha",
        500,
        error.message
      );
    }

    return success(data);

  } catch (error) {
    console.error(
      "[FICHAS_PUT_FATAL]",
      error
    );

    return fail(
      "Erro interno no servidor",
      500
    );
  }
}

/* ──────────────────────────────────────────
   DELETE → REMOVER FICHA
────────────────────────────────────────── */

export async function DELETE(
  _req: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return fail(
        "ID inválido"
      );
    }

    const supabase =
      await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("fichas")
      .delete()
      .eq("id", id)
      .select(`
        id,
        conteudo,
        created_at
      `);

    if (error) {
      console.error(
        "[FICHAS_DELETE_ERROR]",
        error
      );

      return fail(
        "Erro ao deletar ficha",
        500,
        error.message
      );
    }

    if (!data?.length) {
      return fail(
        "Ficha não encontrada",
        404
      );
    }

    return success({
      deleted: data[0],
    });

  } catch (error) {
    console.error(
      "[FICHAS_DELETE_FATAL]",
      error
    );

    return fail(
      "Erro interno no servidor",
      500
    );
  }
}
