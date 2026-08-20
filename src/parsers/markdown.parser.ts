import { readFile } from "node:fs/promises";
import path from "node:path";

import type { DocumentParser } from "./parser";
import type { ParsedDocument } from "./types";

export class MarkdownParser implements DocumentParser {
  supports(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();

    return ext === ".md" || ext === ".markdown";
  }

  async parse(filePath: string): Promise<ParsedDocument> {
    const text = await readFile(filePath, "utf-8");

    return {
      filename: path.basename(filePath),
      mimeType: "text/markdown",
      text,
    };
  }
}