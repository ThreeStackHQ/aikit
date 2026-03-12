export type Tier = "free" | "pro" | "business";

interface TierLimits {
  monthlyRequests: number;
  dailyRequests: number;
  ratePerMin: number;
  apiKeys: number;
  budgetLimitUsd: number;
  maxProviderKeys: number;
}

const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    monthlyRequests: 100,
    dailyRequests: 10,
    ratePerMin: 10,
    apiKeys: 1,
    budgetLimitUsd: 5,
    maxProviderKeys: 1,
  },
  pro: {
    monthlyRequests: 10_000 * 30, // ~300K/mo = 10K/day
    dailyRequests: 10_000,
    ratePerMin: 60,
    apiKeys: 10,
    budgetLimitUsd: 50,
    maxProviderKeys: 5,
  },
  business: {
    monthlyRequests: Infinity,
    dailyRequests: 100_000,
    ratePerMin: 600,
    apiKeys: Infinity,
    budgetLimitUsd: 500,
    maxProviderKeys: Infinity,
  },
} as const;

export function getTierLimits(tier: Tier): TierLimits {
  return TIER_LIMITS[tier];
}

export function getMonthlyRequestLimit(tier: Tier): number {
  return TIER_LIMITS[tier].monthlyRequests;
}

export function getRateLimit(tier: Tier): number {
  return TIER_LIMITS[tier].ratePerMin;
}

export function getApiKeyLimit(tier: Tier): number {
  return TIER_LIMITS[tier].apiKeys;
}

export function getBudgetLimit(tier: Tier): number {
  return TIER_LIMITS[tier].budgetLimitUsd;
}

export function getMaxProviderKeys(tier: Tier): number {
  return TIER_LIMITS[tier].maxProviderKeys;
}
