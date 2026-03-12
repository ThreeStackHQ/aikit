import OpenAI from "openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderResponse {
  content: string;
  model: string;
  provider: "openai" | "anthropic" | "google";
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export async function callOpenAI(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<ProviderResponse> {
  const client = new OpenAI({ apiKey });
  const start = Date.now();

  const response = await client.chat.completions.create({
    model,
    messages,
    stream: false,
  });

  const choice = response.choices[0];
  if (!choice?.message?.content) {
    throw new Error("Empty response from OpenAI");
  }

  return {
    content: choice.message.content,
    model: response.model,
    provider: "openai",
    inputTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
    latencyMs: Date.now() - start,
  };
}

export async function* streamOpenAI(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): AsyncGenerator<string, ProviderResponse> {
  const client = new OpenAI({ apiKey });
  const start = Date.now();

  const stream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
    stream_options: { include_usage: true },
  });

  let inputTokens = 0;
  let outputTokens = 0;
  let finalModel = model;

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
    if (chunk.usage) {
      inputTokens = chunk.usage.prompt_tokens;
      outputTokens = chunk.usage.completion_tokens;
    }
    if (chunk.model) finalModel = chunk.model;
  }

  return {
    content: "",
    model: finalModel,
    provider: "openai",
    inputTokens,
    outputTokens,
    latencyMs: Date.now() - start,
  };
}
