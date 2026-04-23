export function formatarParaWhatsApp(text: string) {
  return text
    .split("\n")
    .map((line, index) => {
      const isFirst = index === 0;

      if (isFirst) {
        return `*${line.trim()}*`;
      }

      const isQtdPalavras = /quantidade de palavras/i.test(line);

      // 🔥 mantém linha inteira em negrito
      if (isQtdPalavras) {
        return `*${line.trim()}*`;
      }

      const indexColon = line.indexOf(":");

      // sem ":" → retorna normal
      if (indexColon === -1) {
        return line;
      }

      const key = line.slice(0, indexColon).trim();
      const value = line.slice(indexColon + 1).trim();

      return `*${key}:* ${value}`;
    })
    .join("\n");
}