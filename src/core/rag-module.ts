export type RagSource = {
  documentId: number;
  chunkIndex: number;
  score: number;
};

export type RagQueryResult = {
  answer: string;
  sources: RagSource[];
};

export interface RagModule {
  id: string;
  name: string;
  description: string;

  routingKeywords: string[];
  routingExamples: string[];

  ingest(
    filePath: string,
    originalFilename?: string
  ): Promise<number>;

  query(
    question: string
  ): Promise<RagQueryResult>;

  getDocuments(): Promise<unknown[]>;

  deleteDocument(
    documentId: number
  ): Promise<boolean>;
}