import type { RetrievalResult } from "../retrieval/retriever";

export function buildContext(
  results: RetrievalResult[]
): string {
  return results
    .map((result, index) => {
      return `Source ${index + 1}:\n${result.text}`;
    })
    .join("\n\n");
}