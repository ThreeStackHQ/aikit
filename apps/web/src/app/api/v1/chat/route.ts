import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { apiKeys, costBudgets, workspaces } from "@aikit/db/schema";
import { db } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { routeToProvider, detectProvider } from "@/lib/providers";
import { logRequest, isOverBudget } from "@/lib/request-logger";
import type { ChatMessage } from "@/lib/providers/openai";

const chatSchema = z.object({
  model: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      })
    )
    .min(1),
  stream: z.boolean().optional().default(false),
});

function errorResponse(message: string, type: string, code: string, status: number) {
  return NextResponse.json({ error: { message, type, code } }, { status });
}

/**
 * Authenticate API key from X-AIKit-Key header
 * Returns the apiKey record if valid, null otherwise
 */
async function authenticateApiKey(authHeader: string | null) {
  if (!authHeader) return null;

  // Support both "Bearer ak_xxx" and raw "ak_xxx"
  const rawKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (!rawKey.startsWith("ak_")) return null;

  const keyPrefix = rawKey.slice(0, 8);

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyPrefix, keyPrefix), eq(apiKeys.isActive, true)))
    .limit(1);

  if (!key) return null;

  const isValid = await bcrypt.compare(rawKey, key.keyHash);
  if (!isValid) return null;

  // Update lastUsedAt async
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))
    .catch(console.error);

  return key;
}

/**
 * Check rate limit: sliding window per API key, 60s window
 * Returns true if within limit
 */
async function checkRateLimit(keyId: string, rateLimit: number): Promise<boolean> {
  const redis = getRedis();
  const redisKey = `rl:${keyId}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - 60;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(redisKey, 0, windowStart);
  pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
  pipeline.zcard(redisKey);
  pipeline.expire(redisKey, 120);

  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) ?? 0;

  return count <= rateLimit;
}

export async function POST(request: Request) {
  const start = Date.now();

  // 1. Authenticate
  const apiKeyHeader =
    request.headers.get("X-AIKit-Key") ?? request.headers.get("Authorization");
  const keyRecord = await authenticateApiKey(apiKeyHeader);

  if (!keyRecord) {
    return errorResponse(
      "Invalid or missing API key. Pass X-AIKit-Key: ak_xxx in your request.",
      "authentication_error",
      "invalid_api_key",
      401
    );
  }

  // 2. Check rate limit
  const withinLimit = await checkRateLimit(keyRecord.id, keyRecord.rateLimitPerMin);
  if (!withinLimit) {
    void logRequest({
      workspaceId: keyRecord.workspaceId,
      apiKeyId: keyRecord.id,
      model: "unknown",
      provider: "openai",
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - start,
      statusClass: "rate_limited",
    });
    return errorResponse(
      `Rate limit exceeded. You're limited to ${keyRecord.rateLimitPerMin} requests/minute.`,
      "rate_limit_error",
      "rate_limit_exceeded",
      429
    );
  }

  // 3. Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", "invalid_request_error", "invalid_json", 400);
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.errors[0]?.message ?? "Validation error",
      "invalid_request_error",
      "invalid_request",
      400
    );
  }

  const { model, messages } = parsed.data;

  // 4. Detect provider (validate model prefix early)
  let provider: ReturnType<typeof detectProvider>;
  try {
    provider = detectProvider(model);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Invalid model",
      "invalid_request_error",
      "invalid_model",
      400
    );
  }

  // 5. Check cost budget
  const overBudget = await isOverBudget(keyRecord.workspaceId);
  if (overBudget) {
    void logRequest({
      workspaceId: keyRecord.workspaceId,
      apiKeyId: keyRecord.id,
      model,
      provider,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - start,
      statusClass: "budget_exceeded",
    });

    // Get limit for error message
    const [budget] = await db
      .select({ limit: costBudgets.monthlyLimitUsd })
      .from(costBudgets)
      .where(eq(costBudgets.workspaceId, keyRecord.workspaceId))
      .limit(1);

    return errorResponse(
      `Monthly budget of $${budget?.limit ?? "?"} exceeded. Upgrade your plan to continue.`,
      "billing_error",
      "budget_exceeded",
      402
    );
  }

  // 6. Route to provider
  let providerResponse;
  try {
    providerResponse = await routeToProvider({
      model,
      messages: messages as ChatMessage[],
      workspaceId: keyRecord.workspaceId,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Provider error";

    void logRequest({
      workspaceId: keyRecord.workspaceId,
      apiKeyId: keyRecord.id,
      model,
      provider,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - start,
      statusClass: "provider_error",
    });

    return errorResponse(errMsg, "provider_error", "provider_error", 502);
  }

  // 7. Log request async (fire-and-forget)
  void logRequest({
    workspaceId: keyRecord.workspaceId,
    apiKeyId: keyRecord.id,
    model,
    provider,
    inputTokens: providerResponse.inputTokens,
    outputTokens: providerResponse.outputTokens,
    latencyMs: providerResponse.latencyMs,
    statusClass: "success",
  });

  // 8. Get workspace slug for response ID
  const [workspace] = await db
    .select({ slug: workspaces.slug })
    .from(workspaces)
    .where(eq(workspaces.id, keyRecord.workspaceId))
    .limit(1);

  // 9. Return OpenAI-compatible response
  const responseId = `chatcmpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const completionResponse = {
    id: responseId,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: providerResponse.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: providerResponse.content,
        },
        finish_reason: "stop",
        logprobs: null,
      },
    ],
    usage: {
      prompt_tokens: providerResponse.inputTokens,
      completion_tokens: providerResponse.outputTokens,
      total_tokens: providerResponse.inputTokens + providerResponse.outputTokens,
    },
    system_fingerprint: workspace?.slug ?? null,
    // AIKit metadata
    _aikit: {
      provider: providerResponse.provider,
      latency_ms: providerResponse.latencyMs,
    },
  };

  return NextResponse.json(completionResponse);
}
