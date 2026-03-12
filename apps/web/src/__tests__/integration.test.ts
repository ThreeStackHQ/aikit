/**
 * AIKit [3.5] Integration Tests
 *
 * These tests cover the core API flows for AIKit:
 * - Proxy request routing
 * - Rate limit enforcement
 * - Budget cap enforcement
 * - API key CRUD
 * - Stripe webhook handling
 *
 * NOTE: These are unit/integration tests with mocked DB + Redis.
 * For full E2E tests, run against a staging environment with real PostgreSQL + Redis.
 */

import { NextRequest } from "next/server";

// ─── Mocks ─────────────────────────────────────────────────────────────────

// Mock the database
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  onConflictDoNothing: jest.fn().mockReturnThis(),
};

jest.mock("@/lib/db", () => ({ db: mockDb }));

// Mock Redis
const mockPipeline = {
  zremrangebyscore: jest.fn().mockReturnThis(),
  zadd: jest.fn().mockReturnThis(),
  zcard: jest.fn().mockReturnThis(),
  expire: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([[null, 1], [null, 1], [null, 1], [null, 1]]), // count=1
};
const mockRedis = {
  pipeline: jest.fn(() => mockPipeline),
};
jest.mock("@/lib/redis", () => ({ getRedis: jest.fn(() => mockRedis) }));

// Mock bcrypt (speed up tests)
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue("$2b$12$hashedkey"),
}));

// Mock nanoid
jest.mock("nanoid", () => ({ nanoid: jest.fn(() => "test32charrandomuniqid01234567") }));

// Mock provider routing
jest.mock("@/lib/providers", () => ({
  routeToProvider: jest.fn(),
  detectProvider: jest.fn(),
}));

// Mock request logger
jest.mock("@/lib/request-logger", () => ({
  logRequest: jest.fn().mockResolvedValue(undefined),
  isOverBudget: jest.fn().mockResolvedValue(false),
}));

// Mock auth (for API key management routes)
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// Mock Stripe
jest.mock("@/lib/stripe", () => ({
  getStripe: jest.fn(() => ({
    webhooks: {
      constructEvent: jest.fn(),
    },
  })),
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────

import bcrypt from "bcryptjs";
import { POST as chatPOST } from "@/app/api/v1/chat/route";
import { GET as apiKeysGET, POST as apiKeysPOST } from "@/app/api/api-keys/route";
import { POST as stripePOST } from "@/app/api/stripe/webhook/route";
import { GET as statsGET } from "@/app/api/stats/route";
import { auth } from "@/lib/auth";
import { routeToProvider, detectProvider } from "@/lib/providers";
import { isOverBudget, logRequest } from "@/lib/request-logger";
import { getStripe } from "@/lib/stripe";

// ─── Helpers ────────────────────────────────────────────────────────────────

const VALID_KEY_PREFIX = "ak_test1";
const VALID_RAW_KEY = "ak_test1abcdef0123456789";
const MOCK_API_KEY_RECORD = {
  id: "key-uuid-001",
  workspaceId: "ws-uuid-001",
  keyPrefix: VALID_KEY_PREFIX,
  keyHash: "$2b$12$hashedkey",
  isActive: true,
  rateLimitPerMin: 60,
  name: "Test Key",
  createdAt: new Date(),
  lastUsedAt: null,
};

function makeRequest(method: string, path: string, body?: unknown, headers?: Record<string, string>): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function mockDbSelectResult(result: unknown[]) {
  mockDb.select.mockReturnValueOnce({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(result),
      }),
    }),
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("AIKit Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: rate limit OK (count=1, within limit)
    mockPipeline.exec.mockResolvedValue([[null, 1], [null, 1], [null, 1], [null, 1]]);
    // Default: not over budget
    (isOverBudget as jest.Mock).mockResolvedValue(false);
  });

  // ── 1. POST /api/v1/chat — valid API key ──────────────────────────────────
  describe("POST /api/v1/chat", () => {
    test("1. routes request with valid API key", async () => {
      // Setup: valid key found in DB
      mockDbSelectResult([MOCK_API_KEY_RECORD]);
      // Setup: workspace found
      mockDbSelectResult([{ slug: "test-workspace" }]);
      // Setup: bcrypt matches
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      // Setup: DB update async (lastUsedAt)
      mockDb.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
      // Setup: provider routing succeeds
      (detectProvider as jest.Mock).mockReturnValue("openai");
      (routeToProvider as jest.Mock).mockResolvedValue({
        content: "Hello from AI!",
        model: "gpt-4o-mini",
        provider: "openai",
        inputTokens: 10,
        outputTokens: 20,
        latencyMs: 150,
      });

      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      }, { "X-AIKit-Key": VALID_RAW_KEY });

      const res = await chatPOST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.object).toBe("chat.completion");
      expect(data.choices[0].message.content).toBe("Hello from AI!");
      expect(data._aikit.provider).toBe("openai");
    });

    // ── 2. Invalid API key → 401 ──────────────────────────────────────────
    test("2. rejects missing API key with 401", async () => {
      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      });

      const res = await chatPOST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error.code).toBe("invalid_api_key");
    });

    test("3. rejects invalid API key (wrong hash) with 401", async () => {
      // Key found by prefix, but hash doesn't match
      mockDbSelectResult([MOCK_API_KEY_RECORD]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // hash mismatch

      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      }, { "X-AIKit-Key": "ak_test1wronghash" });

      const res = await chatPOST(req);
      expect(res.status).toBe(401);
    });

    test("4. rejects inactive API key with 401", async () => {
      // No active key found (isActive=false filtered by query)
      mockDbSelectResult([]); // empty result = no active key

      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      }, { "X-AIKit-Key": VALID_RAW_KEY });

      const res = await chatPOST(req);
      expect(res.status).toBe(401);
    });

    // ── 3. Rate limit → 429 ───────────────────────────────────────────────
    test("5. enforces rate limit and returns 429", async () => {
      mockDbSelectResult([MOCK_API_KEY_RECORD]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockDb.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });

      // Simulate rate limit exceeded: count > rateLimitPerMin (60)
      mockPipeline.exec.mockResolvedValueOnce([
        [null, 1],
        [null, 1],
        [null, 61], // count = 61, exceeds limit of 60
        [null, 1],
      ]);

      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      }, { "X-AIKit-Key": VALID_RAW_KEY });

      const res = await chatPOST(req);
      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error.code).toBe("rate_limit_exceeded");
    });

    // ── 4. Budget exceeded → 402 ──────────────────────────────────────────
    test("6. enforces budget cap and returns 402", async () => {
      mockDbSelectResult([MOCK_API_KEY_RECORD]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockDb.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });

      // Budget exceeded
      (isOverBudget as jest.Mock).mockResolvedValueOnce(true);
      // Budget limit for error message
      mockDbSelectResult([{ limit: "50.00" }]);

      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      }, { "X-AIKit-Key": VALID_RAW_KEY });

      const res = await chatPOST(req);
      expect(res.status).toBe(402);
      const data = await res.json();
      expect(data.error.code).toBe("budget_exceeded");
    });

    // ── Validation ────────────────────────────────────────────────────────
    test("7. rejects invalid model with 400", async () => {
      mockDbSelectResult([MOCK_API_KEY_RECORD]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockDb.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });

      (detectProvider as jest.Mock).mockImplementation(() => {
        throw new Error("Unknown model prefix: 'unknown-model'");
      });

      const req = makeRequest("POST", "/api/v1/chat", {
        model: "unknown-model-xyz",
        messages: [{ role: "user", content: "Hello" }],
      }, { "X-AIKit-Key": VALID_RAW_KEY });

      const res = await chatPOST(req);
      expect(res.status).toBe(400);
    });

    test("8. rejects empty messages array with 400", async () => {
      mockDbSelectResult([MOCK_API_KEY_RECORD]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockDb.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });

      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [], // invalid: min 1
      }, { "X-AIKit-Key": VALID_RAW_KEY });

      const res = await chatPOST(req);
      expect(res.status).toBe(400);
    });

    test("9. uses Authorization Bearer header as fallback", async () => {
      mockDbSelectResult([MOCK_API_KEY_RECORD]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockDb.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
      (detectProvider as jest.Mock).mockReturnValue("openai");
      (routeToProvider as jest.Mock).mockResolvedValue({
        content: "Hello",
        model: "gpt-4o-mini",
        provider: "openai",
        inputTokens: 5,
        outputTokens: 10,
        latencyMs: 100,
      });
      mockDbSelectResult([{ slug: "ws" }]);

      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      }, { Authorization: `Bearer ${VALID_RAW_KEY}` });

      const res = await chatPOST(req);
      expect(res.status).toBe(200);
    });
  });

  // ── 5. GET /api/api-keys ──────────────────────────────────────────────────
  describe("GET /api/api-keys", () => {
    test("10. returns 401 if not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const req = makeRequest("GET", "/api/api-keys");
      const res = await apiKeysGET();
      expect(res.status).toBe(401);
    });

    test("11. returns API keys for authenticated user", async () => {
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: "user-001", workspaceId: "ws-uuid-001" },
      });

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([MOCK_API_KEY_RECORD]),
        }),
      });

      const req = makeRequest("GET", "/api/api-keys");
      const res = await apiKeysGET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("success");
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  // ── 6. POST /api/api-keys ─────────────────────────────────────────────────
  describe("POST /api/api-keys", () => {
    test("12. creates API key for authenticated user", async () => {
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: "user-001", workspaceId: "ws-uuid-001" },
      });

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: "key-uuid-002",
            name: "My New Key",
            keyPrefix: "ak_test3",
          }]),
        }),
      });

      const req = makeRequest("POST", "/api/api-keys", { name: "My New Key" });
      const res = await apiKeysPOST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.status).toBe("success");
      expect(data.data.key).toMatch(/^ak_/); // raw key returned once
      expect(data.data.message).toContain("won't be shown again");
    });

    test("13. rejects empty name with 400", async () => {
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: "user-001", workspaceId: "ws-uuid-001" },
      });

      const req = makeRequest("POST", "/api/api-keys", { name: "" });
      const res = await apiKeysPOST(req);
      expect(res.status).toBe(400);
    });

    test("14. rejects unauthenticated API key creation with 401", async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const req = makeRequest("POST", "/api/api-keys", { name: "Test" });
      const res = await apiKeysPOST(req);
      expect(res.status).toBe(401);
    });
  });

  // ── 7. POST /api/stripe/webhook ───────────────────────────────────────────
  describe("POST /api/stripe/webhook", () => {
    const VALID_STRIPE_SIG = "t=1234567890,v1=abcdef";

    beforeEach(() => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";
    });

    test("15. accepts valid Stripe webhook signature", async () => {
      const mockEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            customer: "cus_test123",
            metadata: { workspaceId: "ws-uuid-001", tier: "pro" },
          },
        },
      };

      (getStripe as jest.Mock)().webhooks.constructEvent.mockReturnValueOnce(mockEvent);

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const req = new NextRequest("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": VALID_STRIPE_SIG,
        },
        body: JSON.stringify({ type: "checkout.session.completed" }),
      });

      const res = await stripePOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("success");
    });

    test("16. rejects invalid Stripe signature with 400", async () => {
      (getStripe as jest.Mock)().webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error("Webhook signature verification failed");
      });

      const req = new NextRequest("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "invalid-sig",
        },
        body: "{}",
      });

      const res = await stripePOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("Invalid signature");
    });

    test("17. rejects missing Stripe signature with 400", async () => {
      const req = new NextRequest("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      const res = await stripePOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("Missing signature");
    });
  });

  // ── 8. GET /api/stats ─────────────────────────────────────────────────────
  describe("GET /api/stats", () => {
    test("18. returns usage stats for authenticated user", async () => {
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: "user-001", workspaceId: "ws-uuid-001" },
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            totalRequests: 42,
            totalCost: "1.23456",
          }]),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 3 }]),
        }),
      });

      const res = await statsGET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("success");
      expect(data.data.totalRequests).toBe(42);
      expect(data.data.activeApiKeys).toBe(3);
    });

    test("19. returns 401 for unauthenticated stats request", async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const res = await statsGET();
      expect(res.status).toBe(401);
    });
  });

  // ── 9. Security: IDOR check ───────────────────────────────────────────────
  describe("Security: IDOR Prevention", () => {
    test("20. proxy uses workspaceId from DB record, not request body", async () => {
      mockDbSelectResult([{ ...MOCK_API_KEY_RECORD, workspaceId: "ws-uuid-001" }]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockDb.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
      (detectProvider as jest.Mock).mockReturnValue("openai");

      (routeToProvider as jest.Mock).mockImplementation(({ workspaceId }) => {
        // Assert workspaceId comes from DB, not request
        expect(workspaceId).toBe("ws-uuid-001");
        return Promise.resolve({
          content: "OK",
          model: "gpt-4o-mini",
          provider: "openai",
          inputTokens: 5,
          outputTokens: 5,
          latencyMs: 50,
        });
      });
      mockDbSelectResult([{ slug: "ws" }]);

      // Attempt to inject a different workspaceId in request body
      const req = makeRequest("POST", "/api/v1/chat", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
        workspaceId: "ws-attacker-999", // injected — should be ignored
      }, { "X-AIKit-Key": VALID_RAW_KEY });

      const res = await chatPOST(req);
      expect(res.status).toBe(200);
      // routeToProvider was called with ws-uuid-001, not ws-attacker-999
      expect(routeToProvider).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: "ws-uuid-001" })
      );
    });
  });
});
