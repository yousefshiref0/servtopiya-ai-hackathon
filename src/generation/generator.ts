import { env } from "../config/env";
export async function generateAnswer(
  prompt: string
): Promise<string> {
  const response = await fetch(
    `${env.llmUrl}/v1/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        temperature: 0.1,
        max_tokens: 60,
        stop: ["Question:", "Context:"],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `LLM request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data.choices[0].text

  .trim()

  .split("\n")[0]

  .trim();
}