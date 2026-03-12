import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { users, workspaces, subscriptions, costBudgets } from "@aikit/db/schema";
import { db } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  workspaceName: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "fail", message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "fail", message: parsed.error.errors[0]?.message ?? "Validation error" },
      { status: 400 }
    );
  }

  const { name, email, password, workspaceName } = parsed.data;

  // Check email uniqueness
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ status: "fail", message: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + nanoid(6);

  // Create workspace
  const [workspace] = await db
    .insert(workspaces)
    .values({ name: workspaceName, slug })
    .returning();

  // Create user
  await db.insert(users).values({
    workspaceId: workspace.id,
    email,
    name,
    passwordHash,
  });

  // Create free subscription
  await db.insert(subscriptions).values({ workspaceId: workspace.id });

  // Create default cost budget (no limit on free)
  await db.insert(costBudgets).values({ workspaceId: workspace.id });

  return NextResponse.json({ status: "success", message: "Account created" }, { status: 201 });
}
