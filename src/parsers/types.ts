export type ParsedPage = {
  pageNumber: number;
  text: string;
};

export type ParsedDocument = {
  filename: string;
  mimeType: string;
  text: string;
  pages?: ParsedPage[];
  metadata?: Record<string, unknown>;
};