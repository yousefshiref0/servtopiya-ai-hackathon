import type {
  RagModule,
  RagQueryResult,
} from "../../core/rag-module";

export class TemplateRag implements RagModule {
  readonly id = "replace-with-unique-rag-id";

  readonly name = "Replace With RAG Name";

  readonly description =
    "Describe exactly what this RAG is responsible for.";

  readonly routingKeywords = [
    "keyword one",
    "keyword two",
    "keyword three",
  ];

  readonly routingExamples = [
    "Example question number one?",
    "Example question number two?",
    "Example question number three?",
  ];

  async ingest(
    filePath: string,
    originalFilename?: string
  ): Promise<number> {
    throw new Error(
      "ingest() is not implemented yet"
    );
  }

  async query(
    question: string
  ): Promise<RagQueryResult> {
    throw new Error(
      "query() is not implemented yet"
    );
  }

  async getDocuments(): Promise<unknown[]> {
    return [];
  }

  async deleteDocument(
    documentId: number
  ): Promise<boolean> {
    throw new Error(
      "deleteDocument() is not implemented yet"
    );
  }
}