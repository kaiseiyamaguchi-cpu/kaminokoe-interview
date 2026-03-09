import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

// Stripe署名検証（Web Crypto API使用）
async function verifyStripeSignature(
  payload: string,
  signature: string | null,
  secret: string | undefined
): Promise<boolean> {
  if (!signature || !secret) {
    // 開発時は署名検証をスキップ（本番では必須）
    console.warn("Stripe signature verification skipped - missing signature or secret");
    return !secret; // secretが設定されていなければスキップ
  }

  try {
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const v1Signature = parts.find((p) => p.startsWith("v1="))?.slice(3);

    if (!timestamp || !v1Signature) {
      return false;
    }

    // タイムスタンプ検証（5分以内）
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
      console.error("Stripe webhook timestamp too old");
      return false;
    }

    // HMAC-SHA256署名検証
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expectedSignature === v1Signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Stripe Webhook
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // 署名検証
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid && webhookSecret) {
      console.error("Invalid Stripe signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const event = JSON.parse(body);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { userId, plan } = session.metadata || {};

        if (userId && plan) {
          await ctx.runMutation(internal.purchases.recordPurchaseInternal, {
            userId: userId as Id<"users">,
            stripePaymentId: session.payment_intent || session.id,
            plan: plan as "ticket1" | "ticket3" | "ticket18" | "ticket36",
          });
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(JSON.stringify({ error: "Webhook failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
