import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, ProviderResponse } from "./openai";

// Map OpenAI model names to Anthropic equivalents
function normalizeAnthropicModel(model: string): string {
  const modelMap: Record<string, string> = {
    "claude-3-5-sonnet": "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku": "claude-3-5-haiku-20241022",
    "claude-3-opus": "claude-3-opus-20240229",
    "claude-3-sonnet": "claude-3-sonnet-20240229",
    "claude-3-haiku": "claude-3-haiku-20240307",
  };
  return modelMap[model] ?? model;
}

export async function callAnthropic(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<ProviderResponse> {
  const client = new Anthropic({ apiKey });
  const start = Date.now();

  // Split system messages from conversation
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");

  const response = await client.messages.create({
    model: normalizeAnthropicModel(model),
    max_tokens: 4096,
    system: systemMessages.map((m) => m.content).join("\n") || undefined,
    messages: conversationMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const content = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  return {
    content,
    model: response.model,
    provider: "anthropic",
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs: Date.now() - start,
  };
}

export async function* streamAnthropic(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): AsyncGenerator<string, ProviderResponse> {
  const client = new Anthropic({ apiKey });
  const start = Date.now();

  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");

  const stream = await client.messages.stream({
    model: normalizeAnthropicModel(model),
    max_tokens: 4096,
    system: systemMessages.map((m) => m.content).join("\n") || undefined,
    messages: conversationMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  let inputTokens = 0;
  let outputTokens = 0;
  let finalModel = model;

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
    if (event.type === "message_start") {
      finalModel = event.message.model;
      inputTokens = event.message.usage.input_tokens;
    }
    if (event.type === "message_delta" && "usage" in event) {
      outputTokens = (event as { usage?: { output_tokens?: number } }).usage?.output_tokens ?? 0;
    }
  }

  return {
    content: "",
    model: finalModel,
    provider: "anthropic",
    inputTokens,
    outputTokens,
    latencyMs: Date.now() - start,
  };
}
