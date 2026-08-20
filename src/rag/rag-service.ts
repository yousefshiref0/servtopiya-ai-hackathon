import { ParserRouter } from "../parsers/parser-router";
import { cleanText } from "../processing/cleaner";
import { chunkText } from "../processing/chunker";
import { embedText } from "../embeddings/embedder";
import { env } from "../config/env";

import {
  saveDocument,
  listDocuments,
  deleteDocument,
} from "../db/document-store";

import { vectorRetrieve } from "../retrieval/vector-retriever";
import { buildContext } from "../generation/context-builder";
import { buildPrompt } from "../generation/prompt-builder";
import { generateAnswer } from "../generation/generator";

import {
  calculateFileHash,
  findDocumentByHash,
} from "../db/document-hash";

import type {
  RagModule,
  RagQueryResult,
} from "../core/rag-module";

export class RagService implements RagModule {
  private parserRouter = new ParserRouter();

  readonly id = "servtopiya-main-rag";

  readonly name = "ServTopiya Main RAG";

  readonly description =
    "RAG for shipping, logistics, packing lists, invoices, containers, weights, exporters, importers and shipment documents.";

  readonly routingKeywords = [
    "shipping",
    "shipment",
    "packing list",
    "invoice",
    "container",
    "net weight",
    "gross weight",
    "consignee",
    "importer",
    "exporter",
    "shipper",
    "port",
    "vessel",
    "freight",
    "destination",
    "packages",
  ];

  readonly routingExamples = [
    "What is the total net weight of the shipment?",
    "What is the gross weight?",
    "What is the container number?",
    "Who is the consignee?",
    "Who is the exporter?",
    "What is the invoice number?",
    "What is the port of discharge?",
    "What is the final destination?",
    "What vessel is carrying the shipment?",
    "How many packages are in the shipment?",
  ];

  async ingest(
    filePath: string,
    originalFilename?: string
  ): Promise<number> {
    const fileHash =
      await calculateFileHash(filePath);

    const existingDocumentId =
      await findDocumentByHash(
        this.id,
        fileHash
      );

    if (existingDocumentId) {
      return existingDocumentId;
    }

    const document =
      await this.parserRouter.parse(
        filePath
      );

    if (!document.text.trim()) {
      throw new Error(
        "Document contains no extractable text"
      );
    }

    const cleaned =
      cleanText(document.text);

    const chunks =
      chunkText(
        cleaned,
        env.rag.chunkSize,
        env.rag.chunkOverlap
      );

    if (chunks.length === 0) {
      throw new Error(
        "Document could not be converted into chunks"
      );
    }

    const embeddedChunks = [];

    for (const chunk of chunks) {
      const embedding =
        await embedText(chunk.text);

      embeddedChunks.push({
        id: chunk.id,
        text: chunk.text,
        embedding,
      });
    }

    return saveDocument(
      this.id,
      originalFilename ??
        document.filename,
      document.mimeType,
      fileHash,
      embeddedChunks
    );
  }

  async getDocuments() {
    return listDocuments(
      this.id
    );
  }

  async deleteDocument(
    documentId: number
  ): Promise<boolean> {
    return deleteDocument(
      this.id,
      documentId
    );
  }

  async query(
    question: string
  ): Promise<RagQueryResult> {
    const results =
      await vectorRetrieve(
        this.id,
        question,
        env.rag.topK,
        env.rag.minRelevanceScore
      );

    if (results.length === 0) {
      return {
        answer:
          "I don't know based on the provided documents.",
        sources: [],
      };
    }

    const context =
      buildContext(results);

    const prompt =
      buildPrompt(
        question,
        context
      );

    const answer =
      await generateAnswer(prompt);

    return {
      answer,
      sources: results.map(
        (result) => ({
          documentId:
            result.documentId,
          chunkIndex:
            result.chunkIndex,
          score:
            result.score,
        })
      ),
    };
  }
}