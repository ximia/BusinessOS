import Anthropic from "@anthropic-ai/sdk";
import type { GeneratorRequest } from "./generators";

/**
 * Provider-abstracted AI text generation (Priority 8). Server-only — do not
 * import into client components. The default provider is Anthropic's Claude via
 * the official SDK; swap `generateText` for another provider without touching
 * the generators or the admin UI.
 *
 * Configuration (env):
 *   ANTHROPIC_API_KEY   required to generate for real (SDK reads it directly).
 *   AI_MODEL            optional model override; defaults to claude-opus-4-8.
 */

const DEFAULT_MODEL = "claude-opus-4-8";

/** Whether a real provider is configured. When false, callers use demo output. */
export function isAIConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** The active provider label, for display in the admin UI. */
export function aiProviderLabel(): string {
  return `Claude (${process.env.AI_MODEL || DEFAULT_MODEL})`;
}

/** Run a built prompt through Claude and return the generated text. */
export async function generateText(req: GeneratorRequest): Promise<string> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
  const message = await client.messages.create({
    model: process.env.AI_MODEL || DEFAULT_MODEL,
    max_tokens: req.maxTokens,
    system: req.system,
    messages: [{ role: "user", content: req.user }],
  });

  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
