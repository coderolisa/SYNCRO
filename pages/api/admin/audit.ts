/**
 * API Route: GET /api/admin/audit
 * Allows administrators to query audit logs with various filters
 * 
 * Features:
 * - Query audit logs by user, action, resource type, date range
 * - Pagination support (limit & offset)
 * - Admin authorization required
 * - Returns structured response with total count
 * 
 * Query Parameters:
 * - userId: Filter by specific user
 * - action: Filter by specific action type
 * - resourceType: Filter by resource type
 * - startDate: Filter from date (ISO 8601)
 * - endDate: Filter to date (ISO 8601)
 * - limit: Results per page (default 50, max 1000)
 * - offset: Pagination offset (default 0)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { queryAuditLogs } from '../../lib/db';
import { AdminAuditQuery, AdminAuditResponse, AuditLogDB } from '../../lib/types/audit';

/**
 * Check if user has admin privileges
 * TODO: Integrate with your actual authorization system
 */
function isAdmin(req: NextApiRequest): boolean {
  // This is a placeholder - integrate with your actual auth system
  // Check JWT, session, or custom header
  const adminHeader = req.headers['x-admin-token'];
  const adminCookie = req.headers.cookie?.includes('admin=true');

  // For demonstration purposes, checking header or cookie
  return adminHeader === process.env.ADMIN_API_KEY || adminCookie === true;
}

/**
 * Parse query parameters into AdminAuditQuery object
 */
function parseQueryParams(query: NextApiRequest['query']): AdminAuditQuery {
  return {
    userId: typeof query.userId === 'string' ? query.userId : undefined,
    action: typeof query.action === 'string' ? query.action : undefined,
    resourceType: typeof query.resourceType === 'string' ? query.resourceType : undefined,
    startDate: typeof query.startDate === 'string' ? query.startDate : undefined,
    endDate: typeof query.endDate === 'string' ? query.endDate : undefined,
    limit: typeof query.limit === 'string' ? parseInt(query.limit, 10) : undefined,
    offset: typeof query.offset === 'string' ? parseInt(query.offset, 10) : undefined,
  };
}

/**
 * Validate query parameters
 */
function validateQueryParams(params: AdminAuditQuery): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (params.limit !== undefined && (params.limit < 1 || params.limit > 1000)) {
    errors.push('limit must be between 1 and 1000');
  }

  if (params.offset !== undefined && params.offset < 0) {
    errors.push('offset must be non-negative');
  }

  if (params.startDate) {
    try {
      new Date(params.startDate).toISOString();
    } catch {
      errors.push('startDate must be a valid ISO 8601 date');
    }
  }

  if (params.endDate) {
    try {
      new Date(params.endDate).toISOString();
    } catch {
      errors.push('endDate must be a valid ISO 8601 date');
    }
  }

  if (params.startDate && params.endDate) {
    const startDate = new Date(params.startDate).getTime();
    const endDate = new Date(params.endDate).getTime();
    if (startDate > endDate) {
      errors.push('startDate must be before endDate');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format AuditLogDB response, ensuring proper type handling
 */
function formatResponse(logs: AuditLogDB[]): AuditLogDB[] {
  return logs.map((log) => ({
    ...log,
    // Ensure metadata is parsed if stored as JSON string
    metadata: typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata,
  }));
}

/**
 * Main API handler for GET /api/admin/audit
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminAuditResponse | { success: false; message: string }>
): Promise<void> {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET.',
    });
  }

  // Check admin authorization
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin access required.',
    });
  }

  try {
    // Parse and validate query parameters
    const params = parseQueryParams(req.query);
    const validation = validateQueryParams(params);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${validation.errors.join('; ')}`,
      });
    }

    // Query audit logs
    const { logs, total } = await queryAuditLogs(params);

    // Format response
    const formattedLogs = formatResponse(logs);

    return res.status(200).json({
      success: true,
      data: formattedLogs,
      total,
      limit: params.limit || 50,
      offset: params.offset || 0,
    });
  } catch (err) {
    console.error('[Admin Audit API] Error querying logs:', err);

    return res.status(500).json({
      success: false,
      message: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
  }
}

export default handler;
