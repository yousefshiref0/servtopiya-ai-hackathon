import { db } from "../db/client";
import { embedText } from "../embeddings/embedder";

export type VectorRetrievalResult = {
  id: number;
  documentId: number;
  chunkIndex: number;
  text: string;
  score: number;
};

export async function vectorRetrieve(
  ragId: string,
  question: string,
  topK = 2,
  minScore = 0.3
): Promise<VectorRetrievalResult[]> {
  const questionEmbedding =
    await embedText(question);

  const vector =
    `[${questionEmbedding.join(",")}]`;

  const result = await db.query(
    `
      SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        1 - (dc.embedding <=> $1::vector) AS score
      FROM document_chunks dc
      INNER JOIN documents d
        ON d.id = dc.document_id
      WHERE d.rag_id = $2
        AND 1 - (dc.embedding <=> $1::vector) >= $3
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $4
    `,
    [
      vector,
      ragId,
      minScore,
      topK,
    ]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    documentId: Number(row.document_id),
    chunkIndex: Number(row.chunk_index),
    text: row.content,
    score: Number(row.score),
  }));
}