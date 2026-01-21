import logger from '../config/logger';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  multiplier?: number;
  jitter?: boolean;
}

export class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

/**
 * Calculate delay for exponential backoff with optional jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  options: RetryOptions = {}
): number {
  const {
    initialDelay = 1000,
    maxDelay = 30000,
    multiplier = 2,
    jitter = true,
  } = options;

  const exponentialDelay = Math.min(
    initialDelay * Math.pow(multiplier, attempt - 1),
    maxDelay
  );

  if (jitter) {
    // Add random jitter (0-20% of delay) to prevent thundering herd
    const jitterAmount = exponentialDelay * 0.2 * Math.random();
    return Math.floor(exponentialDelay + jitterAmount);
  }

  return Math.floor(exponentialDelay);
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    multiplier = 2,
    jitter = true,
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry non-retryable errors
      if (error instanceof NonRetryableError) {
        logger.warn(`Non-retryable error on attempt ${attempt}:`, error.message);
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        logger.error(`Failed after ${maxAttempts} attempts:`, error);
        throw error;
      }

      // Calculate delay for next attempt
      const delay = calculateBackoffDelay(attempt, {
        initialDelay,
        maxDelay,
        multiplier,
        jitter,
      });

      logger.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms:`,
        error instanceof Error ? error.message : String(error)
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

