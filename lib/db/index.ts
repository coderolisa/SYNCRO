/**
 * Database connection and query utilities
 */

import { Pool } from 'pg';
import { AuditLogDB, AuditEntry, AdminAuditQuery } from '../types/audit';

// Initialize connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'audit_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Insert multiple audit log entries into the database
 */
export async function insertAuditLogs(
  entries: AuditEntry[]
): Promise<{ success: boolean; count: number; errors: string[] }> {
  const errors: string[] = [];
  let successCount = 0;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const entry of entries) {
      try {
        const query = `
          INSERT INTO audit_logs (
            user_id, action, resource_type, resource_id, 
            metadata, ip_address, user_agent, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id;
        `;

        const values = [
          entry.user_id || null,
          entry.action,
          entry.resource_type,
          entry.resource_id || null,
          JSON.stringify(entry.metadata || {}),
          entry.ip_address || null,
          entry.user_agent || null,
          new Date(entry.timestamp || Date.now()).toISOString(),
        ];

        await client.query(query, values);
        successCount++;
      } catch (err) {
        errors.push(`Failed to insert entry for action ${entry.action}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await client.query('COMMIT');
    return {
      success: errors.length === 0,
      count: successCount,
      errors,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(
      `Transaction failed: ${err instanceof Error ? err.message : String(err)}`
    );
  } finally {
    client.release();
  }
}

/**
 * Query audit logs with optional filters
 */
export async function queryAuditLogs(
  query: AdminAuditQuery
): Promise<{ logs: AuditLogDB[]; total: number }> {
  const limit = Math.min(query.limit || 50, 1000); // Max 1000 per page
  const offset = query.offset || 0;

  let sql = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (query.userId) {
    sql += ` AND user_id = $${paramIndex}`;
    params.push(query.userId);
    paramIndex++;
  }

  if (query.action) {
    sql += ` AND action = $${paramIndex}`;
    params.push(query.action);
    paramIndex++;
  }

  if (query.resourceType) {
    sql += ` AND resource_type = $${paramIndex}`;
    params.push(query.resourceType);
    paramIndex++;
  }

  if (query.startDate) {
    sql += ` AND created_at >= $${paramIndex}`;
    params.push(new Date(query.startDate).toISOString());
    paramIndex++;
  }

  if (query.endDate) {
    sql += ` AND created_at <= $${paramIndex}`;
    params.push(new Date(query.endDate).toISOString());
    paramIndex++;
  }

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) as count FROM (${sql}) as filtered_logs`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Get paginated results
  sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query<AuditLogDB>(sql, params);

  return {
    logs: result.rows,
    total,
  };
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
): Promise<AuditLogDB[]> {
  const query = `
    SELECT * FROM audit_logs 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2;
  `;

  const result = await pool.query<AuditLogDB>(query, [userId, limit]);
  return result.rows;
}

/**
 * Get database pool for direct queries
 */
export function getPool() {
  return pool;
}

/**
 * Close database connection gracefully
 */
export async function closePool() {
  await pool.end();
}
