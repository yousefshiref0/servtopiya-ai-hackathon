import { embedText } from "../embeddings/embedder";
import { cosineSimilarity } from "./similarity";

export type EmbeddedChunk = {
  id: number;
  text: string;
  embedding: number[];
};

export type RetrievalResult = {
  id: number;
  text: string;
  score: number;
};

export async function retrieve(
  question: string,
  chunks: EmbeddedChunk[],
  topK = 3,
  minScore = 0.3
): Promise<RetrievalResult[]> {
  const questionEmbedding = await embedText(question);

  return chunks
    .map((chunk) => ({
      id: chunk.id,
      text: chunk.text,
      score: cosineSimilarity(
        questionEmbedding,
        chunk.embedding
      ),
    }))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}