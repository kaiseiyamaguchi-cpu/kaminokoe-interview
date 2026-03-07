import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const PLANS = {
  single: {
    price: 398,
    sessions: 1,
    name: "1セッション",
  },
  pack10: {
    price: 3580,
    sessions: 10,
    name: "10セッション（10%OFF）",
  },
  pack15: {
    price: 4980,
    sessions: 15,
    name: "15セッション（15%OFF）",
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: `Kaminokoe ${planInfo.name}`,
              description: `面接練習セッション ${planInfo.sessions}回分`,
            },
            unit_amount: planInfo.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      metadata: {
        userId,
        plan,
        sessions: planInfo.sessions.toString(),
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
