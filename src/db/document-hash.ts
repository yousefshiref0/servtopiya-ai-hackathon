import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { db } from "./client";

export async function calculateFileHash(
  filePath: string
): Promise<string> {
  const buffer = await readFile(filePath);

  return createHash("sha256")
    .update(buffer)
    .digest("hex");
}

export async function findDocumentByHash(
  ragId: string,
  hash: string
): Promise<number | null> {
  const result = await db.query(
    `
      SELECT id
      FROM documents
      WHERE rag_id = $1
        AND file_hash = $2
      LIMIT 1
    `,
    [ragId, hash]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return Number(result.rows[0].id);
}