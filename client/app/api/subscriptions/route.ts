import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const subscriptions = [
  {
    id: 1,
    name: "Midjourney",
    category: "Image Generation",
    price: 20,
    status: "active",
    renewsIn: 5,
    userId: "user-1",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Gemini",
    category: "Image Generation",
    price: 20,
    status: "active",
    renewsIn: 12,
    userId: "user-1",
    createdAt: new Date(),
  },
]

export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database with user authentication
    return NextResponse.json({ subscriptions, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, price } = body

    if (!name || !category || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, save to database
    const newSubscription = {
      id: Math.max(...subscriptions.map((s) => s.id), 0) + 1,
      name,
      category,
      price,
      status: "active",
      renewsIn: 30,
      userId: "user-1",
      createdAt: new Date(),
    }

    subscriptions.push(newSubscription)

    return NextResponse.json({ subscription: newSubscription, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
