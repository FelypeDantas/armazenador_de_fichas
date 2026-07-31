export function formatarParaWhatsApp(text: string): string {
  const regexLink = /^https?:\/\/\S+$/i;
  const regexQuantidadePalavras = /quantidade de palavras/i;

  return text
    .split("\n")
    .map((rawLine, index) => {
      const line = rawLine.trim();

      if (!line) return "";

      // Primeira linha sempre em negrito
      if (index === 0) {
        return `*${line}*`;
      }

      // Destacar títulos das fichas como citação do WhatsApp
      if (line.startsWith(">")) {
        return line;
      }

      // Caso queira detectar automaticamente alguns títulos
      // (ajuste conforme sua necessidade)
      if (/^(ficha|dados da ficha|informações da ficha)/i.test(line)) {
        return `> ${line}`;
      }

      // Quantidade de palavras
      if (regexQuantidadePalavras.test(line)) {
        return `*${line}*`;
      }

      const [key, ...rest] = line.split(":");

      // Não possui chave:valor
      if (!rest.length) {
        return line;
      }

      const value = rest.join(":").trim();

      // Links ficam em uma linha separada
      if (regexLink.test(value)) {
        return `*${key.trim()}:*\n${value}`;
      }

      return `*${key.trim()}:* ${value}`;
    })
    .join("\n");
}
