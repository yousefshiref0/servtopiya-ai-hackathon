import { readFile } from "node:fs/promises";
import path from "node:path";

import type { DocumentParser } from "./parser";
import type { ParsedDocument } from "./types";

export class TxtParser implements DocumentParser {
  supports(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === ".txt";
  }

  async parse(filePath: string): Promise<ParsedDocument> {
    const text = await readFile(filePath, "utf-8");

    return {
      filename: path.basename(filePath),
      mimeType: "text/plain",
      text,
    };
  }
}