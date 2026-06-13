export function extractFirstLine(text: string) {
  return text.split("\n")[0] || "Sem nome";
}

export function limparFormatacaoWhatsApp(text: string) {
  return text
    .replace(/\*/g, "")
    .replace(/_/g, "")
    .replace(/~/g, "")
    .replace(/```/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function findColonOutsideParentheses(text: string) {
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "(") depth++;
    else if (char === ")") depth--;

    if (char === ":" && depth === 0) {
      return i;
    }
  }

  return -1;
}