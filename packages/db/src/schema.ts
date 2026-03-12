import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const tierEnum = pgEnum("tier", ["free", "pro", "business"]);
export const providerEnum = pgEnum("provider", ["openai", "anthropic", "google", "mistral", "cohere"]);
export const statusCodeEnum = pgEnum("status_code_class", ["success", "rate_limited", "budget_exceeded", "provider_error", "invalid_request"]);

// Workspaces — one per team/user
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  tier: tierEnum("tier").notNull().default("free"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// API Keys (workspace-scoped, bcrypt hashed)
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull(),
  keyPrefix: varchar("key_prefix", { length: 8 }).notNull(),
  keyHash: text("key_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  rateLimitPerMin: integer("rate_limit_per_min").notNull().default(60),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

// Subscriptions (Stripe)
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id).unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripePriceId: text("stripe_price_id"),
  tier: tierEnum("tier").notNull().default("free"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Request Log — every AI request goes here
export const requestLog = pgTable("request_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id),
  apiKeyId: uuid("api_key_id").references(() => apiKeys.id),
  model: varchar("model", { length: 100 }).notNull(),
  provider: providerEnum("provider").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  latencyMs: integer("latency_ms"),
  statusClass: statusCodeEnum("status_class").notNull().default("success"),
  costUsd: numeric("cost_usd", { precision: 10, scale: 8 }).notNull().default("0"),
  requestMetadata: text("request_metadata"), // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Cost Budgets — per workspace monthly limits
export const costBudgets = pgTable("cost_budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id).unique(),
  monthlyLimitUsd: numeric("monthly_limit_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  currentMonthSpend: numeric("current_month_spend", { precision: 10, scale: 8 }).notNull().default("0"),
  alertThreshold: numeric("alert_threshold", { precision: 5, scale: 2 }).notNull().default("0.8"), // 80%
  lastResetAt: timestamp("last_reset_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
