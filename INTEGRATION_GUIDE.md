/**
 * Integration Guide for Audit Logging System
 * This file provides examples of how to integrate audit logging
 * into different parts of your Next.js application
 */

/* ========================================
   1. INITIALIZE ON APP STARTUP
   ======================================== */

// pages/_app.tsx
import React from 'react';
import type { AppProps } from 'next/app';
import { initializeAuditLogging } from '@/client/lib/audit-log';

function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    // Initialize audit logging when app mounts
    initializeAuditLogging();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;

/* ========================================
   2. LOG USER AUTHENTICATION EVENTS
   ======================================== */

// contexts/AuthContext.tsx
import React from 'react';
import { logEvent, AuditAction } from '@/client/lib/audit-log';

export async function handleUserLogin(email: string, password: string) {
  try {
    const response = await loginAPI(email, password);
    const { user } = response;

    // Log successful login
    await logEvent({
      user_id: user.id,
      action: AuditAction.USER_LOGIN,
      resource_type: 'user',
      resource_id: user.id,
      metadata: {
        email: user.email,
        loginMethod: 'email',
        timestamp: new Date().toISOString(),
      },
    });

    return user;
  } catch (error) {
    // Still log failed login attempts
    await logEvent({
      action: AuditAction.USER_LOGIN,
      resource_type: 'user',
      metadata: {
        email,
        status: 'failed',
        reason: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    });
    throw error;
  }
}

export async function handleUserLogout(userId: string) {
  // Log logout
  await logEvent({
    user_id: userId,
    action: AuditAction.USER_LOGOUT,
    resource_type: 'user',
    resource_id: userId,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

export async function handleUserSignup(email: string, name: string) {
  const response = await signupAPI(email, name);
  const { user } = response;

  // Log signup
  await logEvent({
    user_id: user.id,
    action: AuditAction.USER_SIGNUP,
    resource_type: 'user',
    resource_id: user.id,
    metadata: {
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString(),
      source: 'web',
    },
  });

  return user;
}

/* ========================================
   3. LOG SUBSCRIPTION EVENTS
   ======================================== */

// services/subscriptionService.ts
import { logEvent, AuditAction } from '@/client/lib/audit-log';

export async function createSubscription(userId: string, planId: string) {
  const subscription = await subscriptionAPI.create(planId);

  // Log subscription creation
  await logEvent({
    user_id: userId,
    action: AuditAction.SUBSCRIPTION_CREATED,
    resource_type: 'subscription',
    resource_id: subscription.id,
    metadata: {
      planId,
      planName: subscription.plan.name,
      price: subscription.plan.price,
      currency: subscription.plan.currency,
      billingCycle: subscription.billingCycle,
      createdAt: new Date().toISOString(),
    },
  });

  return subscription;
}

export async function updateSubscription(userId: string, subscriptionId: string, updates: any) {
  const oldSubscription = await subscriptionAPI.get(subscriptionId);
  const newSubscription = await subscriptionAPI.update(subscriptionId, updates);

  // Log subscription update with changes
  await logEvent({
    user_id: userId,
    action: AuditAction.SUBSCRIPTION_UPDATED,
    resource_type: 'subscription',
    resource_id: subscriptionId,
    metadata: {
      changes: {
        from: {
          plan: oldSubscription.plan.id,
          billingCycle: oldSubscription.billingCycle,
        },
        to: {
          plan: newSubscription.plan.id,
          billingCycle: newSubscription.billingCycle,
        },
      },
      reason: updates.reason || 'user_requested',
      updatedAt: new Date().toISOString(),
    },
  });

  return newSubscription;
}

export async function cancelSubscription(
  userId: string,
  subscriptionId: string,
  reason?: string
) {
  const subscription = await subscriptionAPI.get(subscriptionId);

  await subscriptionAPI.cancel(subscriptionId);

  // Log subscription cancellation
  await logEvent({
    user_id: userId,
    action: AuditAction.SUBSCRIPTION_CANCELLED,
    resource_type: 'subscription',
    resource_id: subscriptionId,
    metadata: {
      planId: subscription.plan.id,
      planName: subscription.plan.name,
      cancellationReason: reason || 'Not specified',
      refundStatus: subscription.refundStatus,
      cancelledAt: new Date().toISOString(),
    },
  });
}

/* ========================================
   4. LOG PAYMENT EVENTS
   ======================================== */

// services/paymentService.ts
import { logEvent, AuditAction } from '@/client/lib/audit-log';

export async function processPayment(userId: string, paymentInfo: any) {
  try {
    const transaction = await paymentAPI.process(paymentInfo);

    // Log successful payment
    await logEvent({
      user_id: userId,
      action: AuditAction.PAYMENT_PROCESSED,
      resource_type: 'payment',
      resource_id: transaction.id,
      metadata: {
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod: transaction.paymentMethod,
        subscriptionId: transaction.subscriptionId,
        status: 'success',
        processedAt: new Date().toISOString(),
      },
    });

    return transaction;
  } catch (error) {
    // Log failed payment
    await logEvent({
      user_id: userId,
      action: AuditAction.PAYMENT_FAILED,
      resource_type: 'payment',
      metadata: {
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        paymentMethod: paymentInfo.method,
        reason: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed',
        timestamp: new Date().toISOString(),
      },
    });

    throw error;
  }
}

/* ========================================
   5. LOG SECURITY EVENTS
   ======================================== */

// services/securityService.ts
import { logEvent, AuditAction } from '@/client/lib/audit-log';

export async function enableMFA(userId: string) {
  await mfaAPI.setup(userId);

  // Log MFA enabled
  await logEvent({
    user_id: userId,
    action: AuditAction.SECURITY_ENABLED_MFA,
    resource_type: 'security',
    resource_id: userId,
    metadata: {
      mfaType: '2fa_app', // or '2fa_sms', etc
      enabledAt: new Date().toISOString(),
    },
  });
}

export async function disableMFA(userId: string) {
  await mfaAPI.remove(userId);

  // Log MFA disabled
  await logEvent({
    user_id: userId,
    action: AuditAction.SECURITY_DISABLED_MFA,
    resource_type: 'security',
    resource_id: userId,
    metadata: {
      disabledAt: new Date().toISOString(),
      reason: 'User requested',
    },
  });
}

export async function changePassword(userId: string) {
  // Log could happen after password verification and before change
  // or after confirmation

  await logEvent({
    user_id: userId,
    action: AuditAction.SETTINGS_CHANGED,
    resource_type: 'security',
    resource_id: userId,
    metadata: {
      change: 'password',
      changedAt: new Date().toISOString(),
    },
  });
}

/* ========================================
   6. LOG ACCESS CONTROL EVENTS
   ======================================== */

// middleware/auditMiddleware.ts
import { logEvent, AuditAction } from '@/client/lib/audit-log';

export async function logDataAccess(userId: string, resourceType: string, resourceId: string, allowed: boolean) {
  await logEvent({
    user_id: userId,
    action: allowed ? AuditAction.ACCESS_GRANTED : AuditAction.ACCESS_DENIED,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: {
      accessedAt: new Date().toISOString(),
      reason: allowed ? 'Authorized' : 'Permission denied',
    },
  });
}

/* ========================================
   7. LOG SETTINGS CHANGES
   ======================================== */

// components/SettingsForm.tsx
import React from 'react';
import { logEvent, AuditAction } from '@/client/lib/audit-log';

export function SettingsForm({ userId }: { userId: string }) {
  const handleSettingChange = async (fieldName: string, oldValue: any, newValue: any) => {
    // Update setting in backend
    await updateSettingAPI(fieldName, newValue);

    // Log the change
    await logEvent({
      user_id: userId,
      action: AuditAction.SETTINGS_CHANGED,
      resource_type: 'settings',
      resource_id: userId,
      metadata: {
        field: fieldName,
        oldValue,
        newValue,
        changedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <form>
      <button
        onClick={async () => {
          await handleSettingChange('notifications_email', true, false);
        }}
      >
        Disable Email Notifications
      </button>
    </form>
  );
}

/* ========================================
   8. LOG DATA EXPORTS
   ======================================== */

// services/exportService.ts
import { logEvent, AuditAction } from '@/client/lib/audit-log';

export async function exportUserData(userId: string, format: 'json' | 'csv') {
  const data = await dataAPI.export(format);

  // Log export
  await logEvent({
    user_id: userId,
    action: AuditAction.DATA_EXPORTED,
    resource_type: 'data',
    resource_id: userId,
    metadata: {
      format,
      size: data.length,
      exportedAt: new Date().toISOString(),
    },
  });

  return data;
}

/* ========================================
   9. ADMIN AUDIT DASHBOARD
   ======================================== */

// pages/admin/audit-logs.tsx
import React from 'react';
import { AdminAuditResponse } from '@/lib/types/audit';

export default function AuditLogsDashboard() {
  const [logs, setLogs] = React.useState<AdminAuditResponse | null>(null);
  const [filters, setFilters] = React.useState({
    userId: '',
    action: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0,
  });

  // Fetch audit logs with filters
  const fetchAuditLogs = React.useCallback(async () => {
    const params = new URLSearchParams();

    if (filters.userId) params.append('userId', filters.userId);
    if (filters.action) params.append('action', filters.action);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    params.append('limit', filters.limit.toString());
    params.append('offset', filters.offset.toString());

    const response = await fetch(`/api/admin/audit?${params.toString()}`, {
      headers: {
        'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setLogs(data);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <div>
      <h1>Audit Logs</h1>

      {/* Filter Controls */}
      <div>
        <input
          type="text"
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
        />
        <input
          type="text"
          placeholder="Action"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <button onClick={fetchAuditLogs}>Search</button>
      </div>

      {/* Results Table */}
      {logs && (
        <div>
          <p>Total: {logs.total}</p>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User ID</th>
                <th>Action</th>
                <th>Resource Type</th>
                <th>Resource ID</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.user_id || 'N/A'}</td>
                  <td>{log.action}</td>
                  <td>{log.resource_type}</td>
                  <td>{log.resource_id || 'N/A'}</td>
                  <td>{log.ip_address || 'N/A'}</td>
                  <td>
                    <details>
                      <summary>View</summary>
                      <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ========================================
   10. ERROR BOUNDARY WITH AUDIT
   ======================================== */

// components/ErrorBoundary.tsx
import React from 'react';
import { logEvent } from '@/client/lib/audit-log';

export class ErrorBoundary extends React.Component {
  async logError(error: Error, userId?: string) {
    await logEvent({
      user_id: userId,
      action: 'error.application',
      resource_type: 'error',
      metadata: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
    });
  }

  componentDidCatch(error: Error) {
    this.logError(error);
  }

  render() {
    return this.props.children;
  }
}

/* ========================================
   TESTING & MONITORING
   ======================================== */

// For testing, you can use the test utilities:
// import { runAllTests, quickHealthCheck } from '@/client/lib/audit-log.test';

// In browser console to test:
// > import { runAllTests } from '@/client/lib/audit-log.test'
// > runAllTests()

// Or quick health check:
// > import { quickHealthCheck } from '@/client/lib/audit-log.test'
// > quickHealthCheck()
