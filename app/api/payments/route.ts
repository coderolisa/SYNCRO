import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set")
  }
  return new Stripe(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient()
    const body = await request.json()
    const { amount, currency = "usd", token, planName } = body

    if (!amount || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const charge = await stripe.charges.create({
      amount: Math.round(amount),
      currency,
      source: token,
      description: `Subsync.AI - ${planName} Plan Upgrade`,
      metadata: {
        planName,
      },
    })

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          createdAt: new Date(charge.created * 1000),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process payment" },
      { status: 500 },
    )
  }
}
