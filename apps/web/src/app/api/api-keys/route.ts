import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { apiKeys } from "@aikit/db/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 401 });
  }
  const workspaceId = (session.user as { workspaceId?: string }).workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ status: "fail", message: "No workspace" }, { status: 400 });
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      isActive: apiKeys.isActive,
      rateLimitPerMin: apiKeys.rateLimitPerMin,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.workspaceId, workspaceId));

  return NextResponse.json({ status: "success", data: keys });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 401 });
  }
  const workspaceId = (session.user as { workspaceId?: string }).workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ status: "fail", message: "No workspace" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "fail", message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "fail", message: parsed.error.errors[0]?.message ?? "Validation error" },
      { status: 400 }
    );
  }

  // Generate API key: ak_ prefix + random 32 chars
  const rawKey = "ak_" + nanoid(32);
  const keyPrefix = rawKey.slice(0, 8); // "ak_xxxxx" first 8 chars
  const keyHash = await bcrypt.hash(rawKey, 12);

  const [created] = await db
    .insert(apiKeys)
    .values({
      workspaceId,
      name: parsed.data.name,
      keyPrefix,
      keyHash,
      rateLimitPerMin: 60,
    })
    .returning({ id: apiKeys.id, name: apiKeys.name, keyPrefix: apiKeys.keyPrefix });

  return NextResponse.json(
    {
      status: "success",
      data: {
        ...created,
        // Return the raw key ONCE — it cannot be recovered
        key: rawKey,
        message: "Save this key — it won't be shown again",
      },
    },
    { status: 201 }
  );
}
