import type { ParsedDocument } from "./types";

export interface DocumentParser {
  supports(filePath: string): boolean;
  parse(filePath: string): Promise<ParsedDocument>;
}