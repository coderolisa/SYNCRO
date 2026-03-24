/**
 * QUICK REFERENCE: Audit Logging API
 * Keep this file bookmarked for quick access to common patterns
 */

// ============================================
// INITIALIZATION (Do this once on app startup)
// ============================================

import { initializeAuditLogging } from '@/client/lib/audit-log';

// In pages/_app.tsx or your root component
React.useEffect(() => {
  initializeAuditLogging();
}, []);

// ============================================
// COMMON LOGGING PATTERNS
// ============================================

import { logEvent, AuditAction } from '@/client/lib/audit-log';

// 1. USER SIGNUP
await logEvent({
  user_id: userId,
  action: AuditAction.USER_SIGNUP,
  resource_type: 'user',
  resource_id: userId,
  metadata: { email },
});

// 2. USER LOGIN
await logEvent({
  user_id: userId,
  action: AuditAction.USER_LOGIN,
  resource_type: 'user',
  resource_id: userId,
});

// 3. USER LOGOUT
await logEvent({
  user_id: userId,
  action: AuditAction.USER_LOGOUT,
  resource_type: 'user',
  resource_id: userId,
});

// 4. SUBSCRIPTION CREATED
await logEvent({
  user_id: userId,
  action: AuditAction.SUBSCRIPTION_CREATED,
  resource_type: 'subscription',
  resource_id: subscriptionId,
  metadata: { plan, price },
});

// 5. SUBSCRIPTION UPDATED
await logEvent({
  user_id: userId,
  action: AuditAction.SUBSCRIPTION_UPDATED,
  resource_type: 'subscription',
  resource_id: subscriptionId,
  metadata: { changes },
});

// 6. SUBSCRIPTION CANCELLED
await logEvent({
  user_id: userId,
  action: AuditAction.SUBSCRIPTION_CANCELLED,
  resource_type: 'subscription',
  resource_id: subscriptionId,
  metadata: { reason },
});

// 7. PAYMENT PROCESSED
await logEvent({
  user_id: userId,
  action: AuditAction.PAYMENT_PROCESSED,
  resource_type: 'payment',
  resource_id: transactionId,
  metadata: { amount, currency },
});

// 8. PAYMENT FAILED
await logEvent({
  user_id: userId,
  action: AuditAction.PAYMENT_FAILED,
  resource_type: 'payment',
  metadata: { amount, reason },
});

// 9. MFA ENABLED
await logEvent({
  user_id: userId,
  action: AuditAction.SECURITY_ENABLED_MFA,
  resource_type: 'security',
  resource_id: userId,
});

// 10. MFA DISABLED
await logEvent({
  user_id: userId,
  action: AuditAction.SECURITY_DISABLED_MFA,
  resource_type: 'security',
  resource_id: userId,
});

// 11. ACCESS GRANTED
await logEvent({
  user_id: userId,
  action: AuditAction.ACCESS_GRANTED,
  resource_type: 'resource_type',
  resource_id: resourceId,
});

// 12. ACCESS DENIED
await logEvent({
  user_id: userId,
  action: AuditAction.ACCESS_DENIED,
  resource_type: 'resource_type',
  resource_id: resourceId,
  metadata: { reason },
});

// 13. SETTINGS CHANGED
await logEvent({
  user_id: userId,
  action: AuditAction.SETTINGS_CHANGED,
  resource_type: 'settings',
  resource_id: userId,
  metadata: { field, oldValue, newValue },
});

// 14. DATA EXPORTED
await logEvent({
  user_id: userId,
  action: AuditAction.DATA_EXPORTED,
  resource_type: 'data',
  resource_id: userId,
  metadata: { format },
});

// ============================================
// QUEUE MANAGEMENT
// ============================================

import {
  flushAuditQueue,
  forceFlush,
  getQueueSize,
  getOfflineEntriesCount,
  clearQueue,
} from '@/client/lib/audit-log';

// Manual flush (auto happens every 5s or at 10 events)
await flushAuditQueue();

// Force flush (same as above, explicit name)
await forceFlush();

// Check how many events are queued
const pending = getQueueSize();
console.log(`${pending} events waiting to send`);

// Check how many events are in offline storage
const offline = getOfflineEntriesCount();
console.log(`${offline} events in offline cache`);

// Clear queue (for testing/debugging only)
clearQueue();

// ============================================
// TESTING
// ============================================

import {
  runAllTests,
  quickHealthCheck,
  testEventValidation,
  testBatchSizeLimit,
  testTimeoutFlushing,
  testOfflineStorage,
  testManualFlush,
  testAPIConnectivity,
} from '@/client/lib/audit-log.test';

// Run all tests
await runAllTests();

// Quick health check
await quickHealthCheck();

// Run specific test
await testEventValidation();
await testBatchSizeLimit();
await testOfflineStorage();

// ============================================
// ADMIN API QUERIES
// ============================================

// Get all audit logs (admin only)
GET /api/admin/audit?limit=50&offset=0

// Filter by user
GET /api/admin/audit?userId=user-123&limit=50

// Filter by action
GET /api/admin/audit?action=user.login&limit=50

// Filter by resource type
GET /api/admin/audit?resourceType=subscription&limit=50

// Filter by date range
GET /api/admin/audit?startDate=2024-01-01&endDate=2024-12-31&limit=50

// Combined filters
GET /api/admin/audit?userId=user-123&action=subscription.created&startDate=2024-03-01&limit=50

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

// .env.local or .env.production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=audit_db
DB_USER=postgres
DB_PASSWORD=your-password
ADMIN_API_KEY=super-secret-key

// ============================================
// TYPES (TypeScript)
// ============================================

import {
  AuditEntry,
  BatchAuditRequest,
  AuditLogResponse,
  AuditLogDB,
  AdminAuditQuery,
  AdminAuditResponse,
  AuditAction,
  AuditLog,
  AuditLogDB as DBRecord,
} from '@/lib/types/audit';

// ============================================
// ERROR HANDLING
// ============================================

try {
  await logEvent({
    action: AuditAction.USER_LOGIN,
    resource_type: 'user',
    resource_id: userId,
    user_id: userId,
  });
} catch (error) {
  console.error('Failed to log event:', error);
  // Event will still be saved to localStorage as fallback
}

// ============================================
// CLIENT-SIDE ONLY - DON'T USE SERVER-SIDE
// ============================================

// ❌ DON'T do this in Next.js API routes
// await logEvent(); // Won't work, it's client-only

// ✅ DO use database functions server-side
import { insertAuditLogs, queryAuditLogs } from '@/lib/db';
await insertAuditLogs([{ action: 'test', resource_type: 'test' }]);

// ============================================
// DATABASE QUERIES
// ============================================

-- Get recent audit logs
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 100;

-- Get logs for specific user
SELECT * FROM audit_logs 
WHERE user_id = 'user-123' 
ORDER BY created_at DESC;

-- Get logs by action type
SELECT * FROM audit_logs 
WHERE action = 'user.login' 
ORDER BY created_at DESC;

-- Get logs by date range
SELECT * FROM audit_logs 
WHERE created_at >= '2024-03-01' 
  AND created_at <= '2024-03-31'
ORDER BY created_at DESC;

-- Count by action
SELECT action, COUNT(*) 
FROM audit_logs 
GROUP BY action 
ORDER BY COUNT(*) DESC;

-- Count by user
SELECT user_id, COUNT(*) 
FROM audit_logs 
WHERE user_id IS NOT NULL
GROUP BY user_id 
ORDER BY COUNT(*) DESC;

-- Most active users today
SELECT user_id, COUNT(*) 
FROM audit_logs 
WHERE created_at >= TODAY()
GROUP BY user_id 
ORDER BY COUNT(*) DESC;

-- ============================================
// CONFIGURATION CONSTANTS (in audit-log.ts)
// ============================================

const BATCH_SIZE = 10;           // Events per batch
const BATCH_TIMEOUT = 5000;      // Send every 5 seconds
const MAX_RETRIES = 3;           // Retry failed batches
const RETRY_DELAY = 1000;        // Initial retry delay (doubles each retry)
const STORAGE_KEY_PREFIX = 'audit_';  // localStorage prefix
const STORAGE_QUEUE_KEY = 'audit_queue';  // Queue index

// ============================================
// PREDEFINED AUDIT ACTIONS
// ============================================

AuditAction.USER_SIGNUP
AuditAction.USER_LOGIN
AuditAction.USER_LOGOUT
AuditAction.USER_DELETE
AuditAction.SUBSCRIPTION_CREATED
AuditAction.SUBSCRIPTION_UPDATED
AuditAction.SUBSCRIPTION_CANCELLED
AuditAction.PAYMENT_PROCESSED
AuditAction.PAYMENT_FAILED
AuditAction.SECURITY_ENABLED_MFA
AuditAction.SECURITY_DISABLED_MFA
AuditAction.ACCESS_GRANTED
AuditAction.ACCESS_DENIED
AuditAction.SETTINGS_CHANGED
AuditAction.DATA_EXPORTED

// ============================================
// TROUBLESHOOTING
// ============================================

// Check queue status
console.log('Queue:', getQueueSize(), 'Offline:', getOfflineEntriesCount());

// Manual flush to send pending events
await forceFlush();

// Check if API is working
const response = await fetch('/api/audit', {
  method: 'POST',
  body: JSON.stringify({
    events: [{ action: 'test', resource_type: 'test' }],
  }),
});
console.log(response.status, await response.json());

// Clear queue if stuck (testing only)
clearQueue();

// View offline entries in localStorage
JSON.parse(localStorage.getItem('audit_queue') || '[]');

// ============================================
// USEFUL LINKS
// ============================================

// Main documentation
../AUDIT_LOGGING_README.md

// Integration examples
../INTEGRATION_GUIDE.md

// Deployment checklist
../DEPLOYMENT_CHECKLIST.md

// Type definitions
../lib/types/audit.ts

// Usage examples
../client/lib/audit-log.examples.ts

// Test utilities
../client/lib/audit-log.test.ts
