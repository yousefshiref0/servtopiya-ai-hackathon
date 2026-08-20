import { db } from "./client";

export type ChunkToStore = {
  id: number;
  text: string;
  embedding: number[];
};

export type StoredDocument = {
  id: number;
  ragId: string;
  filename: string;
  mimeType: string;
  fileHash: string | null;
  createdAt: string;
};

export async function saveDocument(
  ragId: string,
  filename: string,
  mimeType: string,
  fileHash: string,
  chunks: ChunkToStore[]
): Promise<number> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const documentResult = await client.query(
      `
        INSERT INTO documents (
          rag_id,
          filename,
          mime_type,
          file_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [
        ragId,
        filename,
        mimeType,
        fileHash,
      ]
    );

    const documentId = Number(
      documentResult.rows[0].id
    );

    for (const chunk of chunks) {
      const vector =
        `[${chunk.embedding.join(",")}]`;

      await client.query(
        `
          INSERT INTO document_chunks (
            document_id,
            chunk_index,
            content,
            embedding
          )
          VALUES ($1, $2, $3, $4::vector)
        `,
        [
          documentId,
          chunk.id,
          chunk.text,
          vector,
        ]
      );
    }

    await client.query("COMMIT");

    return documentId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listDocuments(
  ragId: string
): Promise<StoredDocument[]> {
  const result = await db.query(
    `
      SELECT
        id,
        rag_id,
        filename,
        mime_type,
        file_hash,
        created_at
      FROM documents
      WHERE rag_id = $1
      ORDER BY created_at DESC
    `,
    [ragId]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    ragId: row.rag_id,
    filename: row.filename,
    mimeType: row.mime_type,
    fileHash: row.file_hash,
    createdAt: row.created_at,
  }));
}

export async function deleteDocument(
  ragId: string,
  documentId: number
): Promise<boolean> {
  const result = await db.query(
    `
      DELETE FROM documents
      WHERE id = $1
        AND rag_id = $2
      RETURNING id
    `,
    [
      documentId,
      ragId,
    ]
  );

  return result.rowCount === 1;
}