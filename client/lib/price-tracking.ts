export interface PriceChange {
  id: string
  subscriptionId: number
  name: string
  oldPrice: number
  newPrice: number
  changeDate: Date
  changeType: "increase" | "decrease"
  annualImpact: number
  percentChange: number
}

export function detectPriceChanges(subscription: any): PriceChange | null {
  if (!subscription.priceHistory || subscription.priceHistory.length < 2) {
    return null
  }

  const history = subscription.priceHistory.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
  const latest = history[0]
  const previous = history[1]

  if (latest.amount === previous.amount) {
    return null
  }

  const changeType = latest.amount > previous.amount ? "increase" : "decrease"
  const annualImpact = (latest.amount - previous.amount) * 12
  const percentChange = ((latest.amount - previous.amount) / previous.amount) * 100

  return {
    id: `price_${subscription.id}_${latest.date.getTime()}`,
    subscriptionId: subscription.id,
    name: subscription.name,
    oldPrice: previous.amount,
    newPrice: latest.amount,
    changeDate: latest.date,
    changeType,
    annualImpact,
    percentChange,
  }
}

export function consolidatePriceChanges(changes: PriceChange[]): PriceChange[] {
  // Group by subscription and keep only the most recent change per subscription
  const grouped = new Map<number, PriceChange>()

  changes.forEach((change) => {
    const existing = grouped.get(change.subscriptionId)
    if (!existing || change.changeDate > existing.changeDate) {
      grouped.set(change.subscriptionId, change)
    }
  })

  return Array.from(grouped.values())
}
