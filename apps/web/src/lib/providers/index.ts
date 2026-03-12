import type { ChatMessage, ProviderResponse } from "./openai";
import { callOpenAI } from "./openai";
import { callAnthropic } from "./anthropic";
import { callGoogle } from "./google";
import { eq, and } from "drizzle-orm";
import { providerSettings } from "@aikit/db/schema";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export type Provider = "openai" | "anthropic" | "google";

export interface RouterOptions {
  model: string;
  messages: ChatMessage[];
  workspaceId: string;
}

/**
 * Detect provider from model name prefix
 */
export function detectProvider(model: string): Provider {
  const lower = model.toLowerCase();
  if (lower.startsWith("gpt-") || lower.startsWith("o1") || lower.startsWith("openai/")) {
    return "openai";
  }
  if (lower.startsWith("claude-") || lower.startsWith("anthropic/")) {
    return "anthropic";
  }
  if (lower.startsWith("gemini-") || lower.startsWith("google/")) {
    return "google";
  }
  throw new Error(
    `Unknown model prefix: '${model}'. Use gpt-*, claude-*, or gemini-* prefixes.`
  );
}

/**
 * Get the API key for a provider — workspace key first, then env fallback
 */
async function getProviderKey(workspaceId: string, provider: Provider): Promise<string> {
  const [setting] = await db
    .select()
    .from(providerSettings)
    .where(
      and(
        eq(providerSettings.workspaceId, workspaceId),
        eq(providerSettings.provider, provider),
        eq(providerSettings.isActive, true)
      )
    )
    .limit(1);

  if (setting) {
    return decrypt(setting.apiKey, setting.apiKeyIv);
  }

  // Env fallback (platform-level keys)
  const envMap: Record<Provider, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_AI_API_KEY,
  };

  const key = envMap[provider];
  if (!key) {
    throw new Error(
      `No API key configured for provider '${provider}'. Add one in workspace settings.`
    );
  }
  return key;
}

/**
 * Route a chat request to the correct provider with retry on 5xx
 */
export async function routeToProvider(opts: RouterOptions): Promise<ProviderResponse> {
  const { model, messages, workspaceId } = opts;
  const provider = detectProvider(model);
  const apiKey = await getProviderKey(workspaceId, provider);

  const attempt = async (): Promise<ProviderResponse> => {
    switch (provider) {
      case "openai":
        return callOpenAI(model, messages, apiKey);
      case "anthropic":
        return callAnthropic(model, messages, apiKey);
      case "google":
        return callGoogle(model, messages, apiKey);
    }
  };

  try {
    return await attempt();
  } catch (err: unknown) {
    // Retry once on provider 5xx errors
    const errMsg = err instanceof Error ? err.message : String(err);
    const is5xx =
      errMsg.includes("500") ||
      errMsg.includes("502") ||
      errMsg.includes("503") ||
      errMsg.includes("529") ||
      errMsg.toLowerCase().includes("overloaded") ||
      errMsg.toLowerCase().includes("rate limit");

    if (is5xx) {
      await new Promise((r) => setTimeout(r, 1000));
      return attempt();
    }
    throw err;
  }
}

export type { ChatMessage, ProviderResponse };
export { callOpenAI, callAnthropic, callGoogle };
