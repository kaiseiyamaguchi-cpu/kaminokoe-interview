import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// チケット制の料金プラン（かんぺAI 新プラン）
const PLANS = {
  starter: {
    price: 1200,
    tickets: 10,
    name: "スターター",
    description: "10チケット / 100分間の面接サポート",
  },
  standard: {
    price: 3600,
    tickets: 30,
    name: "スタンダード",
    description: "30チケット / 300分間の面接サポート",
  },
  interview: {
    price: 9990,
    tickets: 100,
    name: "就活パック",
    description: "100チケット / 1000分間の面接サポート",
  },
  addon: {
    price: 1300,
    tickets: 10,
    name: "追加チケット",
    description: "10チケット / 100分間の面接サポート",
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
              name: `かんぺAI ${planInfo.name}`,
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
