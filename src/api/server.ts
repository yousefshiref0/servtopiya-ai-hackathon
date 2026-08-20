import Fastify from "fastify";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";

import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { env } from "../config/env";
import { ragRegistry } from "../core/registry";
import { routeQuestion } from "../core/rag-router";

const app = Fastify({
  logger: true,
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  const statusCode =
    error.statusCode && error.statusCode >= 400
      ? error.statusCode
      : 500;

  return reply.status(statusCode).send({
    error:
      statusCode === 500
        ? "Internal server error"
        : error.message,
  });
});

async function start() {
  try {
    await app.register(multipart, {
      limits: {
        fileSize:
          env.maxUploadSizeMb *
          1024 *
          1024,
        files: 1,
      },
    });

    await app.register(rateLimit, {
      global: false,
    });

    const checkChatRateLimit =
      app.createRateLimit({
        max: 20,
        timeWindow: "1 minute",
      });

    app.get("/health", async () => {
      return {
        status: "ok",
      };
    });

    app.get("/api/rags", async () => {
      return ragRegistry.list().map((rag) => ({
        id: rag.id,
        name: rag.name,
        description: rag.description,
      }));
    });

    app.post(
      "/api/rags/:ragId/query",
      async (request, reply) => {
        const params = request.params as {
          ragId: string;
        };

        const body = request.body as {
          question?: string;
        };

        if (!body?.question?.trim()) {
          return reply.status(400).send({
            error: "question is required",
          });
        }

        const rag =
          ragRegistry.get(params.ragId);

        if (!rag) {
          return reply.status(404).send({
            error: "RAG module not found",
          });
        }

        return rag.query(
          body.question.trim()
        );
      }
    );

    app.get(
      "/api/rags/:ragId/documents",
      async (request, reply) => {
        const params = request.params as {
          ragId: string;
        };

        const rag =
          ragRegistry.get(params.ragId);

        if (!rag) {
          return reply.status(404).send({
            error: "RAG module not found",
          });
        }

        return rag.getDocuments();
      }
    );

    app.delete(
      "/api/rags/:ragId/documents/:id",
      async (request, reply) => {
        const params = request.params as {
          ragId: string;
          id: string;
        };

        const rag =
          ragRegistry.get(params.ragId);

        if (!rag) {
          return reply.status(404).send({
            error: "RAG module not found",
          });
        }

        const documentId =
          Number(params.id);

        if (
          !Number.isInteger(documentId) ||
          documentId <= 0
        ) {
          return reply.status(400).send({
            error: "invalid document id",
          });
        }

        const deleted =
          await rag.deleteDocument(
            documentId
          );

        if (!deleted) {
          return reply.status(404).send({
            error: "document not found",
          });
        }

        return {
          success: true,
          ragId: rag.id,
          documentId,
        };
      }
    );

    app.post(
      "/api/rags/:ragId/ingest",
      async (request, reply) => {
        const params = request.params as {
          ragId: string;
        };

        const rag =
          ragRegistry.get(params.ragId);

        if (!rag) {
          return reply.status(404).send({
            error: "RAG module not found",
          });
        }

        const file =
          await request.file();

        if (!file) {
          return reply.status(400).send({
            error: "file is required",
          });
        }

        const allowedExtensions = [
          ".pdf",
          ".txt",
          ".md",
          ".markdown",
          ".docx",
        ];

        const extension = path
          .extname(file.filename)
          .toLowerCase();

        if (
          !allowedExtensions.includes(
            extension
          )
        ) {
          return reply.status(400).send({
            error:
              `unsupported file type: ${extension}`,
          });
        }

        const uploadsDir =
          path.resolve("uploads");

        await mkdir(uploadsDir, {
          recursive: true,
        });

        const temporaryPath =
          path.join(
            uploadsDir,
            `${crypto.randomUUID()}${extension}`
          );

        const buffer =
          await file.toBuffer();

        await writeFile(
          temporaryPath,
          buffer
        );

        try {
          const documentId =
            await rag.ingest(
              temporaryPath,
              file.filename
            );

          return {
            success: true,
            ragId: rag.id,
            documentId,
            filename: file.filename,
          };
        } finally {
          await unlink(
            temporaryPath
          ).catch(() => {});
        }
      }
    );

    app.post(
      "/api/chat",
      async (request, reply) => {
        const limit =
          await checkChatRateLimit(
            request
          );

        if (
          !limit.isAllowed &&
          limit.isExceeded
        ) {
          return reply.status(429).send({
            error: "Too many requests",
          });
        }

        const body = request.body as {
          question?: string;
        };

        if (!body?.question?.trim()) {
          return reply.status(400).send({
            error: "question is required",
          });
        }

        const question =
          body.question.trim();

        const route =
          await routeQuestion(question);

        if (!route) {
          return {
            answer:
              "I don't know which knowledge source can answer this question.",
            sources: [],
            routing: null,
          };
        }

        const rag =
          ragRegistry.get(route.ragId);

        if (!rag) {
          return reply.status(500).send({
            error:
              "Selected RAG module not found",
          });
        }

        const result =
          await rag.query(question);

        return {
          ...result,
          routing: {
            ragId: route.ragId,
            ragName: route.ragName,
            score: route.score,
          },
        };
      }
    );

    await app.listen({
      host: env.host,
      port: env.port,
    });

    console.log(
      `Multi-RAG API running on http://${env.host}:${env.port}`
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();