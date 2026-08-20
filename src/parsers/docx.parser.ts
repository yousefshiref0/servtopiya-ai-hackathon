import path from "node:path";
import mammoth from "mammoth";

import type { DocumentParser } from "./parser";
import type { ParsedDocument } from "./types";

export class DocxParser implements DocumentParser {
  supports(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === ".docx";
  }

  async parse(filePath: string): Promise<ParsedDocument> {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return {
      filename: path.basename(filePath),
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      text: result.value,
      metadata: {
        warnings: result.messages,
      },
    };
  }
}