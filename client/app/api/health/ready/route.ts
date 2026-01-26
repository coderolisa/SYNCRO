/**
 * Readiness Check Endpoint
 * Verifies that the service is ready to accept traffic
 * Checks critical dependencies (database, external services, etc.)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api/errors'
import { HttpStatus } from '@/lib/api/types'

type DependencyStatus = {
  name: string
  status: 'healthy' | 'unhealthy'
  responseTime?: number
  error?: string
}

async function checkSupabase(): Promise<DependencyStatus> {
  const start = Date.now()
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('subscriptions').select('id').limit(1)
    
    const responseTime = Date.now() - start
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned, which is fine
      return {
        name: 'supabase',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      }
    }

    return {
      name: 'supabase',
      status: 'healthy',
      responseTime,
    }
  } catch (error) {
    return {
      name: 'supabase',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkEnvironment(): Promise<DependencyStatus> {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    return {
      name: 'environment',
      status: 'unhealthy',
      error: `Missing environment variables: ${missing.join(', ')}`,
    }
  }

  return {
    name: 'environment',
    status: 'healthy',
  }
}

export async function GET() {
  const checks: DependencyStatus[] = []

  // Check environment variables
  checks.push(await checkEnvironment())

  // Check database connection
  checks.push(await checkSupabase())

  const allHealthy = checks.every((check) => check.status === 'healthy')
  const status = allHealthy ? 'ready' : 'not_ready'

  const response = {
    status,
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      total: checks.length,
      healthy: checks.filter((c) => c.status === 'healthy').length,
      unhealthy: checks.filter((c) => c.status === 'unhealthy').length,
    },
  }

  if (allHealthy) {
    return createSuccessResponse(response, HttpStatus.OK)
  } else {
    return createErrorResponse(
      ApiErrors.serviceUnavailable('Service is not ready'),
      undefined
    )
  }
}

