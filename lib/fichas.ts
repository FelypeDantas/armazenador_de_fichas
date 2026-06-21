export function getDataNascimento(conteudo: string): Date | null {
  const match = conteudo.match(
    /(\d{2}\/\d{2}\/\d{4})/
  );

  if (!match) return null;

  const [dia, mes, ano] = match[1].split("/");

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );
}

export function getIdade(conteudo: string): number | null {
  const nascimento = getDataNascimento(conteudo);

  if (!nascimento) return null;

  const hoje = new Date();

  let idade =
    hoje.getFullYear() - nascimento.getFullYear();

  const mes = hoje.getMonth() - nascimento.getMonth();

  if (
    mes < 0 ||
    (mes === 0 &&
      hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }

  return idade;
}
