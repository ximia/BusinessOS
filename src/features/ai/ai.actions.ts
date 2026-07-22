"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getGenerator } from "./generators";
import { isAIConfigured, generateText } from "./provider";

export type AIActionState = {
  ok: boolean;
  message: string;
  output?: string;
  /** True when the result is templated demo output (no API key configured). */
  demo?: boolean;
};

/**
 * Generate content with the configured AI provider. Auth-guarded when Supabase
 * is configured (admin-only). Returns templated demo output when no provider
 * key is set, so the tools are explorable out of the box.
 */
export async function generateContent(
  generatorId: string,
  inputs: Record<string, string>
): Promise<AIActionState> {
  const generator = getGenerator(generatorId);
  if (!generator) return { ok: false, message: "Unknown generator." };

  // Validate required fields.
  const missing = generator.fields
    .filter((f) => f.required && !(inputs[f.key] ?? "").trim())
    .map((f) => f.label);
  if (missing.length) {
    return { ok: false, message: `Please fill in: ${missing.join(", ")}.` };
  }

  // Admin guard (only meaningful once Supabase auth is configured).
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "You must be signed in." };
  }

  if (!isAIConfigured()) {
    return {
      ok: true,
      demo: true,
      output: generator.demo(inputs),
      message: "Demo output. Set ANTHROPIC_API_KEY to generate with Claude.",
    };
  }

  try {
    const output = await generateText(generator.build(inputs));
    if (!output) return { ok: false, message: "The model returned no text. Try again." };
    return { ok: true, output, message: "Generated." };
  } catch (err) {
    console.error("[ai] generateContent failed", err);
    return {
      ok: false,
      message: "Generation failed. Check your API key and model, then try again.",
    };
  }
}
