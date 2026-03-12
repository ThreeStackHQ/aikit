type Tier = "free" | "pro" | "business";

const TIER_LIMITS = {
  free: { monthlyRequests: 100, ratePerMin: 10, apiKeys: 1 },
  pro: { monthlyRequests: 10_000, ratePerMin: 60, apiKeys: 10 },
  business: { monthlyRequests: Infinity, ratePerMin: 600, apiKeys: Infinity },
} as const;

export function getMonthlyRequestLimit(tier: Tier): number {
  return TIER_LIMITS[tier].monthlyRequests;
}

export function getRateLimit(tier: Tier): number {
  return TIER_LIMITS[tier].ratePerMin;
}

export function getApiKeyLimit(tier: Tier): number {
  return TIER_LIMITS[tier].apiKeys;
}
