import {
  fail,
  success,
  corsResponse,
} from "@/lib/apiResponse";

import {
  validarConteudo,
  validarTextoOpcional,
} from "@/lib/fichaValidators";

import {
  listarFichas,
  criarFicha,
  tituloExiste,
} from "@/lib/fichaRepository";

type Body = {
  conteudo?: unknown;
  criado_por?: unknown;
  titulo_id?: unknown;
};

/* ──────────────────────────────────────────
   OPTIONS
────────────────────────────────────────── */
export async function OPTIONS() {
  return corsResponse();
}

/* ──────────────────────────────────────────
   GET
────────────────────────────────────────── */

export async function GET() {
  try {
    const fichas =
      await listarFichas();

    return success(fichas);

  } catch (error) {
    console.error(
      "[FICHAS_GET]",
      error
    );

    return fail(
      "Erro ao buscar fichas",
      500
    );
  }
}

/* ──────────────────────────────────────────
   POST
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

    const conteudo =
      validarConteudo(
        body.conteudo
      );

    const criado_por =
      validarTextoOpcional(
        body.criado_por
      );

    const titulo_id =
      validarTextoOpcional(
        body.titulo_id
      );

    const tituloValido =
      await tituloExiste(
        titulo_id
      );

    if (!tituloValido) {
      return fail(
        "Título inválido"
      );
    }

    const ficha =
      await criarFicha({
        conteudo,
        criado_por,
        titulo_id,
      });

    return success(
      ficha,
      201
    );

  } catch (error) {
    console.error(
      "[FICHAS_POST]",
      error
    );

    return fail(
      error instanceof Error
        ? error.message
        : "Erro interno no servidor",
      500
    );
  }
}
