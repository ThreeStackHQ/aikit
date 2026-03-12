import { NextResponse } from "next/server";

/**
 * POST /api/v1/chat
 * 
 * AI API Gateway proxy endpoint — OpenAI-compatible format.
 * Accepts: {"model": "gpt-4o"|"claude-3-opus"|"gemini-1.5-pro", "messages": [...]}
 * 
 * TODO (Bolt Sprint 1): Implement actual provider routing:
 * - Authenticate API key via X-AIKit-Key header
 * - Check rate limit and cost budget
 * - Route to OpenAI / Anthropic / Google based on model prefix
 * - Log request to request_log table
 * - Return OpenAI-compatible response format
 */
export async function POST() {
  return NextResponse.json(
    {
      status: "fail",
      message: "AI proxy not yet implemented — Bolt is building this in Sprint 1",
      hint: "Use X-AIKit-Key: <your-key> header to authenticate once ready",
    },
    { status: 501 }
  );
}
