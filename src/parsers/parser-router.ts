import type { DocumentParser } from "./parser";
import type { ParsedDocument } from "./types";
import { DocxParser } from "./docx.parser";
import { TxtParser } from "./txt.parser";
import { MarkdownParser } from "./markdown.parser";
import { PdfParser } from "./pdf.parser";

export class ParserRouter {
  private parsers: DocumentParser[];

  constructor() {
    this.parsers = [
      new TxtParser(),
      new MarkdownParser(),
      new PdfParser(),
      new DocxParser(),
    ];
  }

  async parse(filePath: string): Promise<ParsedDocument> {
    const parser = this.parsers.find((parser) =>
      parser.supports(filePath)
    );

    if (!parser) {
      throw new Error(`Unsupported file type: ${filePath}`);
    }

    return parser.parse(filePath);
  }
}