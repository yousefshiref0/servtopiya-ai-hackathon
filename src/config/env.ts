import "dotenv/config";

function requireEnv(
  name: string,
  fallback?: string
): string {
  const value = process.env[name] ?? fallback;

  if (value === undefined) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
}

export const env = {
  host: requireEnv("HOST", "127.0.0.1"),

  port: Number(
    requireEnv("PORT", "4000")
  ),

  db: {
    host: requireEnv(
      "DB_HOST",
      "127.0.0.1"
    ),

    port: Number(
      requireEnv("DB_PORT", "5432")
    ),

    name: requireEnv(
      "DB_NAME",
      "servtopiya_rag"
    ),

    user: requireEnv(
      "DB_USER",
      "yousef"
    ),
  },

  llmUrl: requireEnv(
    "LLM_URL",
    "http://127.0.0.1:8080"
  ),

  rag: {
    chunkSize: Number(
      requireEnv(
        "RAG_CHUNK_SIZE",
        "400"
      )
    ),

    chunkOverlap: Number(
      requireEnv(
        "RAG_CHUNK_OVERLAP",
        "80"
      )
    ),

    topK: Number(
      requireEnv(
        "RAG_TOP_K",
        "2"
      )
    ),

    minRelevanceScore: Number(
      requireEnv(
        "RAG_MIN_RELEVANCE_SCORE",
        "0.3"
      )
    ),

    minRoutingScore: Number(
      requireEnv(
        "RAG_MIN_ROUTING_SCORE",
        "0.2"
      )
    ),
  },

  maxUploadSizeMb: Number(
    requireEnv(
      "MAX_UPLOAD_SIZE_MB",
      "20"
    )
  ),
};