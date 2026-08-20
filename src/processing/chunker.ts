export type Chunk = {
  id: number;
  text: string;
};

export function chunkText(
  text: string,
  chunkSize = 800,
  overlap = 150
): Chunk[] {
  if (!text.trim()) return [];

  if (overlap >= chunkSize) {
    throw new Error("overlap must be smaller than chunkSize");
  }

  const chunks: Chunk[] = [];

  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    if (end < text.length) {
      const slice = text.slice(start, end);

      const paragraphBreak = slice.lastIndexOf("\n\n");
      const sentenceBreak = Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("\n")
      );

      const bestBreak = Math.max(paragraphBreak, sentenceBreak);

      if (bestBreak > chunkSize * 0.5) {
        end = start + bestBreak + 1;
      }
    }

    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push({
        id: chunks.length + 1,
        text: chunk,
      });
    }

    if (end >= text.length) break;

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}