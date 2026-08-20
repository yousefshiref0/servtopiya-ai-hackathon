import type {
  RagModule,
  RagQueryResult,
} from "../../core/rag-module";

export class TestRag implements RagModule {
  readonly id = "test-rag";

  readonly name = "Test RAG";

  readonly description =
    "RAG for cooking, food recipes, ingredients, kitchen instructions and meal preparation.";

  readonly routingKeywords = [
    "cooking",
    "recipe",
    "food",
    "ingredients",
    "pasta",
    "rice",
    "kitchen",
    "meal",
  ];

  readonly routingExamples = [
    "How do I cook pasta?",
    "How do I make rice?",
    "What ingredients do I need for pasta?",
    "How long should I boil pasta?",
  ];

  async ingest(
    _filePath: string,
    _originalFilename?: string
  ): Promise<number> {
    return 1;
  }

  async query(
    question: string
  ): Promise<RagQueryResult> {
    return {
      answer: `Test RAG received: ${question}`,
      sources: [],
    };
  }

  async getDocuments(): Promise<unknown[]> {
    return [];
  }

  async deleteDocument(
    _documentId: number
  ): Promise<boolean> {
    return false;
  }
}