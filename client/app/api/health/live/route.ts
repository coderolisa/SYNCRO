/**
 * Liveness Check Endpoint
 * Simple endpoint to verify the service is running
 * Used by orchestration systems (Kubernetes, etc.)
 */

import { NextResponse } from 'next/server'
import { HttpStatus } from '@/lib/api/types'

export async function GET() {
  return NextResponse.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
    },
    { status: HttpStatus.OK }
  )
}

