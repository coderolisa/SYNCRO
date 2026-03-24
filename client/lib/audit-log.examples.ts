/**
 * Example usage of the audit logging system
 * Shows how to integrate audit logging into your application
 */

import {
  logEvent,
  initializeAuditLogging,
  flushAuditQueue,
  forceFlush,
  getQueueSize,
  getOfflineEntriesCount,
} from './audit-log';
import { AuditAction } from '../../lib/types/audit';

/**
 * Initialize on app startup (e.g., in pages/_app.tsx or layout component)
 */
export function setupAuditLogging(): void {
  // Initialize the audit logging system on app startup
  initializeAuditLogging();
  console.log('Audit logging system initialized');
}

/**
 * Example: Log user signup
 */
export async function logUserSignup(userId: string, email: string): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.USER_SIGNUP,
    resource_type: 'user',
    resource_id: userId,
    metadata: {
      email,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log user login
 */
export async function logUserLogin(userId: string): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.USER_LOGIN,
    resource_type: 'user',
    resource_id: userId,
    metadata: {
      loginTime: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log subscription creation
 */
export async function logSubscriptionCreated(
  userId: string,
  subscriptionId: string,
  plan: string
): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.SUBSCRIPTION_CREATED,
    resource_type: 'subscription',
    resource_id: subscriptionId,
    metadata: {
      plan,
      createdAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log subscription update
 */
export async function logSubscriptionUpdated(
  userId: string,
  subscriptionId: string,
  changes: Record<string, any>
): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.SUBSCRIPTION_UPDATED,
    resource_type: 'subscription',
    resource_id: subscriptionId,
    metadata: {
      changes,
      updatedAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log subscription cancellation
 */
export async function logSubscriptionCancelled(
  userId: string,
  subscriptionId: string,
  reason?: string
): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.SUBSCRIPTION_CANCELLED,
    resource_type: 'subscription',
    resource_id: subscriptionId,
    metadata: {
      reason: reason || 'No reason provided',
      cancelledAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log payment processed
 */
export async function logPaymentProcessed(
  userId: string,
  transactionId: string,
  amount: number,
  currency: string
): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.PAYMENT_PROCESSED,
    resource_type: 'payment',
    resource_id: transactionId,
    metadata: {
      amount,
      currency,
      processedAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log security event (MFA enabled)
 */
export async function logMFAEnabled(userId: string): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.SECURITY_ENABLED_MFA,
    resource_type: 'security',
    resource_id: userId,
    metadata: {
      enabledAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log security event (MFA disabled)
 */
export async function logMFADisabled(userId: string): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.SECURITY_DISABLED_MFA,
    resource_type: 'security',
    resource_id: userId,
    metadata: {
      disabledAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log access granted
 */
export async function logAccessGranted(userId: string, resource: string): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.ACCESS_GRANTED,
    resource_type: 'access',
    resource_id: resource,
    metadata: {
      grantedAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log access denied
 */
export async function logAccessDenied(userId: string, resource: string, reason: string): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.ACCESS_DENIED,
    resource_type: 'access',
    resource_id: resource,
    metadata: {
      reason,
      deniedAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log settings change
 */
export async function logSettingsChanged(userId: string, changes: Record<string, any>): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.SETTINGS_CHANGED,
    resource_type: 'settings',
    resource_id: userId,
    metadata: {
      changes,
      changedAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Log data export
 */
export async function logDataExported(userId: string, exportFormat: string): Promise<void> {
  await logEvent({
    user_id: userId,
    action: AuditAction.DATA_EXPORTED,
    resource_type: 'data',
    resource_id: userId,
    metadata: {
      format: exportFormat,
      exportedAt: new Date().toISOString(),
    },
  });
}

/**
 * Example: Monitor queue status
 */
export function monitorQueueStatus(): void {
  const queueSize = getQueueSize();
  const offlineCount = getOfflineEntriesCount();

  console.log(`[Audit Monitor] Queue: ${queueSize}, Offline: ${offlineCount}`);
}

/**
 * Example: Manual flush at specific times
 */
export async function performManualFlush(): Promise<void> {
  console.log('Performing manual audit log flush...');
  const response = await forceFlush();
  if (response?.success) {
    console.log(`Flushed successfully. Stored: ${response.storedCount}`);
  }
}

/**
 * Usage in React component
 */
export function ExampleComponent(): JSX.Element {
  return (
    <div>
      <button
        onClick={async () => {
          await logUserLogin('user-123');
          console.log('Login logged');
        }}
      >
        Log Login
      </button>

      <button
        onClick={async () => {
          await performManualFlush();
        }}
      >
        Flush Audit Queue
      </button>

      <button
        onClick={() => {
          monitorQueueStatus();
        }}
      >
        Monitor Status
      </button>
    </div>
  );
}
