import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { subscriptions } from "@aikit/db/schema";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

const PRICE_IDS: Record<"pro" | "business", string> = {
  pro: process.env.STRIPE_PRICE_PRO_ID ?? "price_pro_placeholder",
  business: process.env.STRIPE_PRICE_BUSINESS_ID ?? "price_business_placeholder",
};

const checkoutSchema = z.object({
  tier: z.enum(["pro", "business"]),
});

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

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "fail", message: parsed.error.errors[0]?.message ?? "Validation error" },
      { status: 400 }
    );
  }

  const { tier } = parsed.data;

  // Check if workspace already has an active subscription
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1);

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aikit.threestack.io";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: PRICE_IDS[tier],
        quantity: 1,
      },
    ],
    metadata: {
      workspaceId,
      tier,
    },
    // Reuse customer if they've checked out before
    ...(existing?.stripeCustomerId
      ? { customer: existing.stripeCustomerId }
      : {}),
    success_url: `${baseUrl}/dashboard?upgraded=true`,
    cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
    subscription_data: {
      metadata: {
        workspaceId,
        tier,
      },
    },
  });

  return NextResponse.json({
    status: "success",
    data: {
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    },
  });
}
