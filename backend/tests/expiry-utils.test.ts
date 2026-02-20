import { daysSince, isExpiredByInactivity, validateExpiryThreshold } from '../src/utils/expiry';

describe('daysSince', () => {
  it('should return 0 for today', () => {
    const now = new Date().toISOString();
    expect(daysSince(now)).toBe(0);
  });

  it('should return correct days for past dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysSince(threeDaysAgo)).toBe(3);
  });

  it('should accept Date objects', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(daysSince(twoDaysAgo)).toBe(2);
  });

  it('should floor partial days', () => {
    // 1.5 days ago
    const date = new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysSince(date)).toBe(1);
  });
});

describe('isExpiredByInactivity', () => {
  it('should return true when days since last_used_at exceeds threshold', () => {
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(isExpiredByInactivity(thirtyOneDaysAgo, createdAt, 30)).toBe(true);
  });

  it('should return false when days since last_used_at is within threshold', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(isExpiredByInactivity(tenDaysAgo, createdAt, 30)).toBe(false);
  });

  it('should return true when exactly at threshold', () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(isExpiredByInactivity(thirtyDaysAgo, createdAt, 30)).toBe(true);
  });

  it('should fall back to created_at when last_used_at is null', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(isExpiredByInactivity(null, sixtyDaysAgo, 30)).toBe(true);
  });

  it('should return false when last_used_at is null and created_at is recent', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(isExpiredByInactivity(null, fiveDaysAgo, 30)).toBe(false);
  });
});

describe('validateExpiryThreshold', () => {
  it('should return null for null input', () => {
    expect(validateExpiryThreshold(null)).toBe(null);
  });

  it('should return null for undefined input', () => {
    expect(validateExpiryThreshold(undefined)).toBe(null);
  });

  it('should return valid integer within range', () => {
    expect(validateExpiryThreshold(30)).toBe(30);
    expect(validateExpiryThreshold(1)).toBe(1);
    expect(validateExpiryThreshold(365)).toBe(365);
  });

  it('should parse string numbers', () => {
    expect(validateExpiryThreshold('90')).toBe(90);
  });

  it('should throw for zero', () => {
    expect(() => validateExpiryThreshold(0)).toThrow();
  });

  it('should throw for negative numbers', () => {
    expect(() => validateExpiryThreshold(-5)).toThrow();
  });

  it('should throw for values over 365', () => {
    expect(() => validateExpiryThreshold(366)).toThrow();
  });

  it('should throw for non-integer numbers', () => {
    expect(() => validateExpiryThreshold(30.5)).toThrow();
  });

  it('should throw for non-numeric strings', () => {
    expect(() => validateExpiryThreshold('abc')).toThrow();
  });
});
