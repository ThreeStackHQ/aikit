import { eq, sql } from "drizzle-orm";
import { requestLog, costBudgets } from "@aikit/db/schema";
import { db } from "@/lib/db";
import type { Provider } from "@/lib/providers";

// Token cost table (USD per 1K tokens)
const COSTS: Record<string, { input: number; output: number }> = {
  // OpenAI
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "o1": { input: 0.015, output: 0.06 },
  "o1-mini": { input: 0.003, output: 0.012 },
  // Anthropic
  "claude-3-5-sonnet": { input: 0.003, output: 0.015 },
  "claude-3-5-haiku": { input: 0.0008, output: 0.004 },
  "claude-3-opus": { input: 0.015, output: 0.075 },
  "claude-3-sonnet": { input: 0.003, output: 0.015 },
  "claude-3-haiku": { input: 0.00025, output: 0.00125 },
  // Google
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
  "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
  "gemini-1.5-flash-8b": { input: 0.0000375, output: 0.00015 },
  "gemini-2.0-flash": { input: 0.0001, output: 0.0004 },
  "gemini-pro": { input: 0.0005, output: 0.0015 },
};

const DEFAULT_COST = { input: 0.001, output: 0.002 }; // Conservative default

/**
 * Calculate cost in USD for a given model + token counts
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Try exact match first, then prefix match
  const rates =
    COSTS[model] ??
    Object.entries(COSTS).find(([key]) => model.toLowerCase().startsWith(key.toLowerCase()))?.[1] ??
    DEFAULT_COST;

  return (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;
}

export interface LogRequestInput {
  workspaceId: string;
  apiKeyId: string | null;
  model: string;
  provider: Provider;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  statusClass: "success" | "rate_limited" | "budget_exceeded" | "provider_error" | "invalid_request";
}

/**
 * Log a request to the database and update monthly spend
 * Fire-and-forget safe: errors are swallowed to not impact response
 */
export async function logRequest(input: LogRequestInput): Promise<void> {
  const costUsd = calculateCost(input.model, input.inputTokens, input.outputTokens);

  try {
    await db.insert(requestLog).values({
      workspaceId: input.workspaceId,
      apiKeyId: input.apiKeyId,
      model: input.model,
      provider: input.provider,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      latencyMs: input.latencyMs,
      statusClass: input.statusClass,
      costUsd: String(costUsd),
    });

    // Update monthly spend if request succeeded
    if (input.statusClass === "success") {
      await updateMonthlySpend(input.workspaceId, costUsd);
    }
  } catch (err) {
    console.error("[request-logger] Failed to log request:", err);
  }
}

/**
 * Update workspace monthly spend and reset if new month
 */
export async function updateMonthlySpend(workspaceId: string, costUsd: number): Promise<void> {
  const now = new Date();

  // Ensure cost_budgets row exists
  await db
    .insert(costBudgets)
    .values({
      workspaceId,
      monthlyLimitUsd: "50", // default $50 limit
      currentMonthSpend: "0",
      alertThreshold: "0.8",
      lastResetAt: now,
    })
    .onConflictDoNothing();

  // Check if we need to reset (new month)
  const [budget] = await db
    .select()
    .from(costBudgets)
    .where(eq(costBudgets.workspaceId, workspaceId))
    .limit(1);

  if (!budget) return;

  const lastReset = new Date(budget.lastResetAt);
  const isNewMonth =
    now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

  if (isNewMonth) {
    await db
      .update(costBudgets)
      .set({
        currentMonthSpend: String(costUsd),
        lastResetAt: now,
        alertSentAt: null,
      })
      .where(eq(costBudgets.workspaceId, workspaceId));
  } else {
    await db
      .update(costBudgets)
      .set({
        currentMonthSpend: sql`${costBudgets.currentMonthSpend} + ${costUsd}`,
      })
      .where(eq(costBudgets.workspaceId, workspaceId));
  }

  // Check if alert should be sent
  await checkBudgetAlert(workspaceId);
}

/**
 * Send Resend email alert when spend reaches alert threshold
 */
async function checkBudgetAlert(workspaceId: string): Promise<void> {
  const [budget] = await db
    .select()
    .from(costBudgets)
    .where(eq(costBudgets.workspaceId, workspaceId))
    .limit(1);

  if (!budget) return;

  const limit = parseFloat(String(budget.monthlyLimitUsd));
  const spend = parseFloat(String(budget.currentMonthSpend));
  const threshold = parseFloat(String(budget.alertThreshold));

  if (limit <= 0) return; // No limit set
  if (spend / limit < threshold) return; // Not hit threshold
  if (budget.alertSentAt) return; // Already sent this month

  // Get workspace owner email
  const { users, workspaces } = await import("@aikit/db/schema");
  const { eq: eqOp } = await import("drizzle-orm");

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eqOp(workspaces.id, workspaceId))
    .limit(1);

  const [owner] = await db
    .select()
    .from(users)
    .where(eqOp(users.workspaceId, workspaceId))
    .limit(1);

  if (!owner?.email || !workspace) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "AIKit <noreply@threestack.io>",
      to: owner.email,
      subject: `⚠️ AIKit budget alert — ${Math.round((spend / limit) * 100)}% used`,
      html: `
        <div style="font-family:sans-serif;max-width:520px">
          <h2>Budget Alert — ${workspace.name}</h2>
          <p>You've used <strong>$${spend.toFixed(4)}</strong> of your <strong>$${limit.toFixed(2)}</strong> monthly budget (${Math.round((spend / limit) * 100)}%).</p>
          <p>Requests will be blocked when 100% is reached. <a href="https://aikit.threestack.io/dashboard">Upgrade your plan</a> to increase your limit.</p>
        </div>
      `,
    });

    // Mark alert sent
    await db
      .update(costBudgets)
      .set({ alertSentAt: new Date() })
      .where(eq(costBudgets.workspaceId, workspaceId));
  } catch (err) {
    console.error("[request-logger] Failed to send budget alert:", err);
  }
}

/**
 * Check if workspace is over budget
 */
export async function isOverBudget(workspaceId: string): Promise<boolean> {
  const [budget] = await db
    .select()
    .from(costBudgets)
    .where(eq(costBudgets.workspaceId, workspaceId))
    .limit(1);

  if (!budget) return false;
  const limit = parseFloat(String(budget.monthlyLimitUsd));
  if (limit <= 0) return false;
  const spend = parseFloat(String(budget.currentMonthSpend));
  return spend >= limit;
}
