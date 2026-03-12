import { NextResponse } from "next/server";
import { eq, count, sum } from "drizzle-orm";
import { requestLog, apiKeys } from "@aikit/db/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 401 });
  }
  const workspaceId = (session.user as { workspaceId?: string }).workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ status: "fail", message: "No workspace" }, { status: 400 });
  }

  const [reqStats] = await db
    .select({
      totalRequests: count(),
      totalCost: sum(requestLog.costUsd),
    })
    .from(requestLog)
    .where(eq(requestLog.workspaceId, workspaceId));

  const [keyCount] = await db
    .select({ count: count() })
    .from(apiKeys)
    .where(eq(apiKeys.workspaceId, workspaceId));

  return NextResponse.json({
    status: "success",
    data: {
      totalRequests: reqStats?.totalRequests ?? 0,
      totalCostUsd: reqStats?.totalCost ?? "0",
      activeApiKeys: keyCount?.count ?? 0,
    },
  });
}
