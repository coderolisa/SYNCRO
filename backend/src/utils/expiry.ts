/**
 * Calculate whole days elapsed since a given date.
 */
export function daysSince(date: string | Date): number {
  const then = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check whether a subscription should be considered expired by inactivity.
 * Uses last_used_at with created_at as fallback when last_used_at is null.
 */
export function isExpiredByInactivity(
  lastUsedAt: string | null,
  createdAt: string,
  thresholdDays: number
): boolean {
  const referenceDate = lastUsedAt || createdAt;
  return daysSince(referenceDate) >= thresholdDays;
}

/**
 * Validate and parse an expiry_threshold value from request input.
 * Returns the parsed number or null (to disable auto-expiry).
 * Throws on invalid values.
 * Rules: must be an integer between 1 and 365, or null/undefined to disable.
 */
export function validateExpiryThreshold(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);

  if (!Number.isInteger(num) || num < 1 || num > 365) {
    throw new Error('expiry_threshold must be an integer between 1 and 365, or null to disable');
  }

  return num;
}
