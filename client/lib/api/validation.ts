/**
 * Request Validation Utilities
 * Provides Zod-based validation for API requests
 */

import { z } from 'zod'
import { type NextRequest } from 'next/server'
import { zodErrorToApiError } from './errors'

/**
 * Parse and validate request body with Zod schema
 */
export async function validateRequestBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw zodErrorToApiError(error)
    }
    throw error
  }
}

/**
 * Parse and validate query parameters with Zod schema
 */
export function validateQueryParams<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  try {
    const url = new URL(request.url)
    const params: Record<string, string> = {}
    
    url.searchParams.forEach((value, key) => {
      params[key] = value
    })

    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw zodErrorToApiError(error)
    }
    throw error
  }
}

/**
 * Parse and validate route parameters with Zod schema
 */
export function validateRouteParams<T extends z.ZodType>(
  params: Record<string, string | string[]>,
  schema: T
): z.infer<T> {
  try {
    // Convert string arrays to single values for validation
    const normalizedParams: Record<string, string> = {}
    for (const [key, value] of Object.entries(params)) {
      normalizedParams[key] = Array.isArray(value) ? value[0] : value
    }

    return schema.parse(normalizedParams)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw zodErrorToApiError(error)
    }
    throw error
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  id: z.object({
    id: z.string().uuid(),
  }),

  email: z.string().email('Invalid email format'),

  url: z.string().url('Invalid URL format'),

  date: z.string().datetime('Invalid date format'),

  positiveNumber: z.coerce.number().positive('Must be a positive number'),

  nonEmptyString: z.string().min(1, 'Cannot be empty'),
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

