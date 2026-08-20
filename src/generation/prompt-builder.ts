export function buildPrompt(
  question: string,
  context: string
): string {
  return `
You are a precise question-answering assistant.

Rules:
- Answer ONLY from the provided context.
- Answer ONLY the user's question.
- Keep the answer short and direct.
- Do NOT add unrelated information.
- Do NOT repeat the answer.
- Do NOT make assumptions.
- If the answer is not present in the context, respond exactly with:
"I don't know based on the provided documents."

Context:
${context}

Question:
${question}

Direct answer:
`.trim();
}