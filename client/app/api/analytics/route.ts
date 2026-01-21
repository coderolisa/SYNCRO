import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In production, fetch analytics from database
    const analytics = {
      totalSpend: 120,
      monthlySpend: 120,
      categoryBreakdown: [
        { category: "Image Generation", spend: 60, percentage: 50 },
        { category: "Code Generation", spend: 40, percentage: 33 },
        { category: "Productivity", spend: 20, percentage: 17 },
      ],
      spendTrend: [
        { month: "Jan", spend: 100 },
        { month: "Feb", spend: 110 },
        { month: "Mar", spend: 120 },
      ],
    }

    return NextResponse.json({ analytics, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
