/**
 * API Route: POST /api/audit
 * Handles batch audit event submission from clients
 * 
 * Features:
 * - Validates incoming batch requests
 * - Extracts IP address from request
 * - Stores events in database with transaction support
 * - Returns structured response with success/failure counts
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { insertAuditLogs } from '../../lib/db';
import { BatchAuditRequest, AuditLogResponse, AuditEntry } from '../../lib/types/audit';

/**
 * Extract client IP address from request
 */
function getClientIP(req: NextApiRequest): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] as string | undefined;
}

/**
 * Validate batch request structure and content
 */
function validateBatchRequest(body: unknown): {
  valid: boolean;
  errors: string[];
  request?: BatchAuditRequest;
} {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a JSON object');
    return { valid: false, errors };
  }

  const request = body as Record<string, unknown>;

  if (!Array.isArray(request.events)) {
    errors.push('events must be a non-empty array');
  } else if (request.events.length === 0) {
    errors.push('events array cannot be empty');
  } else if (request.events.length > 1000) {
    errors.push('events array cannot exceed 1000 items');
  } else {
    // Validate each event
    request.events.forEach((event: unknown, index: number) => {
      if (typeof event !== 'object' || event === null) {
        errors.push(`events[${index}] must be a JSON object`);
      } else {
        const e = event as Record<string, unknown>;
        if (!e.action || typeof e.action !== 'string') {
          errors.push(`events[${index}].action is required and must be a string`);
        }
        if (!e.resource_type || typeof e.resource_type !== 'string') {
          errors.push(`events[${index}].resource_type is required and must be a string`);
        }
      }
    });
  }

  if (errors.length === 0) {
    return {
      valid: true,
      errors: [],
      request: request as BatchAuditRequest,
    };
  }

  return { valid: false, errors };
}

/**
 * Enrich audit entries with server-side information
 */
function enrichAuditEntries(
  entries: AuditEntry[],
  clientIP: string | undefined,
  userAgent: string | undefined,
  userId: string | undefined
): AuditEntry[] {
  return entries.map((entry) => ({
    ...entry,
    user_id: entry.user_id || userId,
    ip_address: entry.ip_address || clientIP,
    user_agent: entry.user_agent || userAgent,
  }));
}

/**
 * Extract user ID from request headers or session
 * This should be integrated with your actual authentication system
 */
function extractUserId(req: NextApiRequest): string | undefined {
  // TODO: Implement actual user extraction from session/JWT
  // This is a placeholder - integrate with your actual auth system
  return req.headers['x-user-id'] as string | undefined;
}

/**
 * Main API handler for POST /api/audit
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuditLogResponse>
): Promise<void> {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  }

  try {
    // Validate request
    const validation = validateBatchRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${validation.errors.join('; ')}`,
      });
    }

    const batch = validation.request!;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    const userId = extractUserId(req);

    // Enrich entries with server information
    const enrichedEntries = enrichAuditEntries(
      batch.events,
      clientIP,
      typeof userAgent === 'string' ? userAgent : undefined,
      userId
    );

    // Store in database
    const result = await insertAuditLogs(enrichedEntries);

    // Return response
    return res.status(200).json({
      success: result.success,
      message: result.success
        ? `Successfully stored ${result.count} audit events`
        : `Partially stored audit events. Stored: ${result.count}, Errors: ${result.errors.length}`,
      batchId: batch.batchId,
      storedCount: result.count,
      failedCount: result.errors.length,
    });
  } catch (err) {
    console.error('[Audit API] Error processing batch:', err);

    return res.status(500).json({
      success: false,
      message: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
  }
}

export default handler;
