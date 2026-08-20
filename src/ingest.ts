import { ParserRouter } from "./parsers/parser-router";
import { cleanText } from "./processing/cleaner";
import { chunkText } from "./processing/chunker";
import { embedText } from "./embeddings/embedder";
import { saveDocument } from "./db/document-store";
import { db } from "./db/client";

async function main() {
  const router = new ParserRouter();

  console.log("Parsing document...");

  const document = await router.parse(
    "samples/test.pdf"
  );

  const cleaned = cleanText(document.text);

  const chunks = chunkText(cleaned, 400, 80);

  console.log(`Total chunks: ${chunks.length}`);
  console.log("Creating embeddings...");

  const embeddedChunks = [];

  for (const chunk of chunks) {
    console.log(
      `Embedding chunk ${chunk.id}/${chunks.length}`
    );

    const embedding = await embedText(chunk.text);

    embeddedChunks.push({
      id: chunk.id,
      text: chunk.text,
      embedding,
    });
  }

  console.log("Saving to PostgreSQL...");

  const documentId = await saveDocument(
    document.filename,
    document.mimeType,
    embeddedChunks
  );

  console.log(
    `Document saved successfully. ID: ${documentId}`
  );

  await db.end();
}

main().catch(async (error) => {
  console.error(error);
  await db.end();
  process.exit(1);
});