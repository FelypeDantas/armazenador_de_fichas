import {
  fail,
  success,
} from "@/lib/apiResponse";

import {
  validarConteudo,
  validarTextoOpcional,
} from "@/lib/fichaValidators";

import {
  atualizarFicha,
  removerFicha,
  tituloExiste,
} from "@/lib/fichaRepository";

type Body = {
  conteudo?: unknown;
  titulo_id?: unknown;
};

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/* ──────────────────────────────────────────
   PUT
────────────────────────────────────────── */

export async function PUT(
  req: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return fail("ID inválido");
    }

    let body: Body;

    try {
      body = await req.json();
    } catch {
      return fail("JSON inválido");
    }

    const conteudo =
      validarConteudo(body.conteudo);

    const titulo_id =
      validarTextoOpcional(
        body.titulo_id
      );

    const tituloValido =
      await tituloExiste(
        titulo_id
      );

    if (!tituloValido) {
      return fail("Título inválido");
    }

    const ficha =
      await atualizarFicha({
        id,
        conteudo,
        titulo_id,
      });

    return success(ficha);

  } catch (error) {
    console.error(
      "[FICHAS_PUT]",
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

/* ──────────────────────────────────────────
   DELETE
────────────────────────────────────────── */

export async function DELETE(
  _req: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return fail("ID inválido");
    }

    const ficha =
      await excluirFicha(id);

    return success({
      deleted: ficha,
    });

  } catch (error) {
    console.error(
      "[FICHAS_DELETE]",
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
