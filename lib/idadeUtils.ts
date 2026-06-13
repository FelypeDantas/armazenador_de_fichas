export function extrairDataNascimento(
  conteudo: string
): Date | null {
  const match = conteudo.match(
    /Data de Nascimento.*?:\s*(\d{2})\/(\d{2})\/(\d{4})/i
  );

  if (!match) return null;

  const [, dia, mes, ano] = match;

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );
}

export function calcularIdade(
  nascimento: Date
): number {
  const hoje = new Date();

  let idade =
    hoje.getFullYear() -
    nascimento.getFullYear();

  const fezAniversario =
    hoje.getMonth() > nascimento.getMonth() ||
    (
      hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() >= nascimento.getDate()
    );

  if (!fezAniversario) {
    idade--;
  }

  return idade;
}

export function obterCategoriaPorIdade(
  conteudo: string
): "brancas" | "vermelhas" | null {
  const data =
    extrairDataNascimento(conteudo);

  if (!data) return null;

  const idade = calcularIdade(data);

  return idade < 18
    ? "brancas"
    : "vermelhas";
}
