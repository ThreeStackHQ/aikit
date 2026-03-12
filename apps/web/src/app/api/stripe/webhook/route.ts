import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { subscriptions, workspaces } from "@aikit/db/schema";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ status: "fail", message: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ status: "fail", message: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ status: "fail", message: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (!workspaceId) break;

      const tier = session.metadata?.tier as "pro" | "business" | undefined;
      if (!tier) break;

      await db
        .update(subscriptions)
        .set({
          stripeCustomerId: session.customer as string,
          tier,
          status: "active",
        })
        .where(eq(subscriptions.workspaceId, workspaceId));

      await db
        .update(workspaces)
        .set({ tier })
        .where(eq(workspaces.id, workspaceId));
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const result = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeCustomerId, sub.customer as string))
        .limit(1);

      if (result[0]) {
        await db
          .update(subscriptions)
          .set({ tier: "free", status: "canceled" })
          .where(eq(subscriptions.id, result[0].id));

        await db
          .update(workspaces)
          .set({ tier: "free" })
          .where(eq(workspaces.id, result[0].workspaceId));
      }
      break;
    }
  }

  return NextResponse.json({ status: "success" });
}
