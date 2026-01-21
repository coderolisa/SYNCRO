export function detectDuplicates(subscriptions: any[]) {
  const duplicates: any[] = []
  const subscriptionGroups: Record<string, any[]> = {}

  subscriptions.forEach((sub) => {
    // Normalize name for better matching
    const normalizedName = normalizeName(sub.name)

    if (!subscriptionGroups[normalizedName]) {
      subscriptionGroups[normalizedName] = []
    }
    subscriptionGroups[normalizedName].push(sub)
  })

  Object.entries(subscriptionGroups).forEach(([normalizedName, subs]) => {
    if (subs.length > 1) {
      const totalCost = subs.reduce((sum, s) => sum + s.price, 0)
      const potentialSavings = totalCost - Math.min(...subs.map((s) => s.price))

      duplicates.push({
        name: subs[0].name,
        normalizedName,
        count: subs.length,
        subscriptions: subs,
        totalCost,
        potentialSavings,
        priceConflict: hasPriceConflict(subs),
      })
    }
  })

  return duplicates
}

function normalizeName(name: string): string {
  // Remove common suffixes and normalize
  return name
    .toLowerCase()
    .replace(/\s+(plus|pro|premium|basic|standard|enterprise|team|business)$/i, "")
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

function hasPriceConflict(subscriptions: any[]): boolean {
  const prices = subscriptions.map((s) => s.price)
  return new Set(prices).size > 1
}

export function fuzzyMatch(str1: string, str2: string): boolean {
  const normalized1 = normalizeName(str1)
  const normalized2 = normalizeName(str2)

  // Exact match after normalization
  if (normalized1 === normalized2) return true

  // Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(normalized1, normalized2)
  const maxLength = Math.max(normalized1.length, normalized2.length)

  // Allow 20% difference
  return distance / maxLength < 0.2
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}
