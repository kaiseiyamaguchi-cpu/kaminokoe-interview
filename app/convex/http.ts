import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

// Stripe Webhook
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();

    // Stripe署名検証（本番では必須）
    // const sig = request.headers.get("stripe-signature");
    // TODO: stripe.webhooks.constructEvent で検証

    try {
      const event = JSON.parse(body);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { userId, plan } = session.metadata || {};

        if (userId && plan) {
          await ctx.runMutation(internal.purchases.recordPurchaseInternal, {
            userId: userId as Id<"users">,
            stripePaymentId: session.payment_intent || session.id,
            plan: plan as "single" | "pack10" | "pack15",
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
