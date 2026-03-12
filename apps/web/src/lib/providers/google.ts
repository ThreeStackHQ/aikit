import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage, ProviderResponse } from "./openai";

function normalizeGoogleModel(model: string): string {
  const modelMap: Record<string, string> = {
    "gemini-1.5-pro": "gemini-1.5-pro",
    "gemini-1.5-flash": "gemini-1.5-flash",
    "gemini-1.5-flash-8b": "gemini-1.5-flash-8b",
    "gemini-2.0-flash": "gemini-2.0-flash",
    "gemini-pro": "gemini-pro",
  };
  return modelMap[model] ?? model;
}

export async function callGoogle(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<ProviderResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model: normalizeGoogleModel(model) });
  const start = Date.now();

  // Extract system prompt
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");

  const systemInstruction = systemMessages.map((m) => m.content).join("\n");

  // Build history (all but last message)
  const history = conversationMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = conversationMessages[conversationMessages.length - 1];
  if (!lastMessage) throw new Error("No messages provided");

  const chat = gemini.startChat({
    history,
    systemInstruction: systemInstruction || undefined,
  });

  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const text = response.text();

  // Google SDK doesn't expose raw token counts easily; estimate via chars / 4
  const estimatedInputTokens = Math.ceil(
    messages.reduce((acc, m) => acc + m.content.length, 0) / 4
  );
  const estimatedOutputTokens = Math.ceil(text.length / 4);

  return {
    content: text,
    model: normalizeGoogleModel(model),
    provider: "google",
    inputTokens: estimatedInputTokens,
    outputTokens: estimatedOutputTokens,
    latencyMs: Date.now() - start,
  };
}

export async function* streamGoogle(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): AsyncGenerator<string, ProviderResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model: normalizeGoogleModel(model) });
  const start = Date.now();

  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");
  const systemInstruction = systemMessages.map((m) => m.content).join("\n");
  const history = conversationMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = conversationMessages[conversationMessages.length - 1];
  if (!lastMessage) throw new Error("No messages provided");

  const chat = gemini.startChat({
    history,
    systemInstruction: systemInstruction || undefined,
  });

  const stream = await chat.sendMessageStream(lastMessage.content);
  let fullText = "";

  for await (const chunk of stream.stream) {
    const text = chunk.text();
    fullText += text;
    yield text;
  }

  const inputTokens = Math.ceil(messages.reduce((acc, m) => acc + m.content.length, 0) / 4);
  const outputTokens = Math.ceil(fullText.length / 4);

  return {
    content: "",
    model: normalizeGoogleModel(model),
    provider: "google",
    inputTokens,
    outputTokens,
    latencyMs: Date.now() - start,
  };
}
