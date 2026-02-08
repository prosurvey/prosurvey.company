const NBSP = "\u00A0";

const SHORT_WORD_RE = /(^|[\s([{'"«„])([A-Za-zА-Яа-яЁё]{1,3})\s+([("'«„]*)(?=[A-Za-zА-Яа-яЁё])/gu;
const LAST_WORD_RE = /(\S)\s+(\S+)\s*$/u;

function keepShortWordWithNext(line: string): string {
  return line.replace(
    SHORT_WORD_RE,
    (_match, prefix: string, shortWord: string, openingPunctuation: string) =>
      `${prefix}${shortWord}${NBSP}${openingPunctuation}`,
  );
}

function keepLastWordWithPrevious(line: string): string {
  return line.replace(LAST_WORD_RE, `$1${NBSP}$2`);
}

export function applyTypographyNbsp(text: string): string {
  if (!text.includes(" ")) return text;

  return text
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      return keepLastWordWithPrevious(keepShortWordWithNext(line));
    })
    .join("\n");
}
