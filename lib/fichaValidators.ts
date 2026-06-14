export function validarConteudo(
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

  if (texto.length > 10000) {
    throw new Error(
      "Ficha muito grande"
    );
  }

  return texto;
}

export function validarTextoOpcional(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const texto = value.trim();

  return texto || null;
}