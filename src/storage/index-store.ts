import { readFile, writeFile } from "node:fs/promises";

export type StoredChunk = {
  id: number;
  text: string;
  embedding: number[];
};

export async function saveIndex(
  filePath: string,
  chunks: StoredChunk[]
): Promise<void> {
  await writeFile(
    filePath,
    JSON.stringify(chunks, null, 2),
    "utf-8"
  );
}

export async function loadIndex(
  filePath: string
): Promise<StoredChunk[]> {
  const raw = await readFile(filePath, "utf-8");

  return JSON.parse(raw) as StoredChunk[];
}