import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

import type { DocumentParser } from "./parser";
import type { ParsedDocument } from "./types";

export class PdfParser implements DocumentParser {
  supports(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === ".pdf";
  }

  async parse(filePath: string): Promise<ParsedDocument> {
    const buffer = await readFile(filePath);

    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();

      return {
        filename: path.basename(filePath),
        mimeType: "application/pdf",
        text: result.text,
        metadata: {
          totalPages: result.total,
        },
      };
    } finally {
      await parser.destroy();
    }
  }
}