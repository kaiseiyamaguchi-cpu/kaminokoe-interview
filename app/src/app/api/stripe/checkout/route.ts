import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// チケット制の新プラン
const PLANS = {
  ticket1: {
    price: 200,
    tickets: 1,
    name: "1チケット",
    description: "10分間の面接練習",
  },
  ticket3: {
    price: 500,
    tickets: 3,
    name: "30分パック",
    description: "30分間の面接練習（3チケット）",
  },
  ticket18: {
    price: 2500,
    tickets: 18,
    name: "5回分パック",
    description: "180分間の面接練習（18チケット）",
  },
  ticket36: {
    price: 5000,
    tickets: 36,
    name: "10回分パック",
    description: "360分間の面接練習（36チケット）",
  },
} as const;

type PlanType = keyof typeof PLANS;

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();

    if (!plan || !PLANS[plan as PlanType]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const planInfo = PLANS[plan as PlanType];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: `神の声 ${planInfo.name}`,
              description: planInfo.description,
            },
            unit_amount: planInfo.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/mypage?success=true&plan=${plan}&tickets=${planInfo.tickets}`,
      cancel_url: `${appUrl}/mypage?canceled=true`,
      metadata: {
        userId,
        plan,
        tickets: planInfo.tickets.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
