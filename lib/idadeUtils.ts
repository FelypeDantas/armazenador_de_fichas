const IDADE_MAIORIDADE = 18;

export type CategoriaRosa =
  | "brancas"
  | "vermelhas";

/**
 * Extrai a data de nascimento da ficha.
 * Ex:
 * Data de Nascimento: 01/05/2005
 */
export function extrairDataNascimento(
  conteudo: string
): Date | null {
  const regex =
    /data\s*de\s*nascimento.*?:\s*(\d{2})\/(\d{2})\/(\d{4})/i;

  const match = conteudo.match(regex);

  if (!match) {
    return null;
  }

  const [, dia, mes, ano] = match;

  const data = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  return Number.isNaN(data.getTime())
    ? null
    : data;
}

/**
 * Calcula idade com base na data de nascimento.
 */
export function calcularIdade(
  nascimento: Date
): number {
  const hoje = new Date();

  let idade =
    hoje.getFullYear() -
    nascimento.getFullYear();

  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (
      hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate()
    );

  if (aindaNaoFezAniversario) {
    idade--;
  }

  return idade;
}

/**
 * Obtém idade diretamente do conteúdo.
 */
export function obterIdadeDaFicha(
  conteudo: string
): number | null {
  const nascimento =
    extrairDataNascimento(conteudo);

  if (!nascimento) {
    return null;
  }

  return calcularIdade(nascimento);
}

/**
 * Define a categoria automaticamente.
 *
 * < 18 anos  => Rosas Brancas
 * >= 18 anos => Rosas Vermelhas
 */
export function obterCategoriaPorIdade(
  conteudo: string
): CategoriaRosa | null {
  const idade =
    obterIdadeDaFicha(conteudo);

  if (idade === null) {
    return null;
  }

  return idade < IDADE_MAIORIDADE
    ? "brancas"
    : "vermelhas";
}
