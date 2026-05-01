export function formatarParaWhatsApp(text: string) {
  return text
    .split("\n")
    .map((line, index) => {
      const isFirst = index === 0;

      if (isFirst) {
        return `*${line.trim()}*`;
      }

      const isQtdPalavras = /quantidade de palavras/i.test(line);

      if (isQtdPalavras) {
        return `*${line.trim()}*`;
      }

      const indexColon = line.indexOf(":");

      if (indexColon === -1) {
        return line;
      }

      const key = line.slice(0, indexColon).trim();
      const value = line.slice(indexColon + 1).trim();

      // 🧠 DETECTA LINK
      const isLink = /^https?:\/\/\S+$/i.test(value);

      // 🔗 Se for link → NÃO aplica formatação no valor
      if (isLink) {
        return `*${key}:*\n${value}`;
      }

      return `*${key}:* ${value}`;
    })
    .join("\n");
}
