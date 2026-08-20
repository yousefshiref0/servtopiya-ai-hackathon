import { embedText } from "../embeddings/embedder";
import { cosineSimilarity } from "../retrieval/similarity";
import { ragRegistry } from "./registry";
import { env } from "../config/env";
export type RagRouteResult = {
  ragId: string;
  ragName: string;
  score: number;
};

const ragEmbeddingCache = new Map<
  string,
  number[]
>();

const MIN_ROUTING_SCORE = env.rag.minRoutingScore;

function buildRoutingProfile(
  rag: ReturnType<typeof ragRegistry.list>[number]
): string {
  return [
    rag.name,
    rag.description,

    `Keywords: ${rag.routingKeywords.join(", ")}`,

    `Example questions:
${rag.routingExamples.join("\n")}`,
  ].join("\n\n");
}

async function getRagEmbedding(
  rag: ReturnType<typeof ragRegistry.list>[number]
): Promise<number[]> {
  const cached =
    ragEmbeddingCache.get(rag.id);

  if (cached) {
    return cached;
  }

  const profile =
    buildRoutingProfile(rag);

  const embedding =
    await embedText(profile);

  ragEmbeddingCache.set(
    rag.id,
    embedding
  );

  return embedding;
}

export async function routeQuestion(
  question: string
): Promise<RagRouteResult | null> {
  const rags = ragRegistry.list();

  if (rags.length === 0) {
    return null;
  }

  const questionEmbedding =
    await embedText(question);

  const results: RagRouteResult[] = [];

  for (const rag of rags) {
    const ragEmbedding =
      await getRagEmbedding(rag);

    const score =
      cosineSimilarity(
        questionEmbedding,
        ragEmbedding
      );

    results.push({
      ragId: rag.id,
      ragName: rag.name,
      score,
    });
  }

  results.sort(
    (a, b) => b.score - a.score
  );

  const best = results[0];

  if (!best) {
    return null;
  }

  if (best.score < env.rag.minRoutingScore) {
    return null;
  }

  return best;
}