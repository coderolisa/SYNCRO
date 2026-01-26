import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { isMaintenanceMode } from "@/lib/api/env"

// Security headers
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

export async function middleware(request: NextRequest) {
  // Check maintenance mode (skip for health checks)
  if (
    isMaintenanceMode() &&
    !request.nextUrl.pathname.startsWith("/api/health")
  ) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Service is currently under maintenance",
        },
      },
      { status: 503 }
    )
  }

  // Update Supabase session and handle auth redirects
  const response = await updateSession(request)

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add request ID for tracing
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID()
  response.headers.set("x-request-id", requestId)

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
