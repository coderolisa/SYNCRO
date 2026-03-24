/**
 * Type definitions for audit logging system
 */

export interface AuditEntry {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp?: number;
}

export interface BatchAuditRequest {
  events: AuditEntry[];
  batchId?: string;
}

export interface AuditLogDB {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  success: boolean;
  message: string;
  batchId?: string;
  storedCount?: number;
  failedCount?: number;
}

export interface AdminAuditQuery {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AdminAuditResponse {
  success: boolean;
  data: AuditLogDB[];
  total: number;
  limit: number;
  offset: number;
}

export enum AuditAction {
  USER_SIGNUP = "user.signup",
  USER_LOGIN = "user.login",
  USER_LOGOUT = "user.logout",
  USER_DELETE = "user.delete",
  SUBSCRIPTION_CREATED = "subscription.created",
  SUBSCRIPTION_UPDATED = "subscription.updated",
  SUBSCRIPTION_CANCELLED = "subscription.cancelled",
  PAYMENT_PROCESSED = "payment.processed",
  PAYMENT_FAILED = "payment.failed",
  SECURITY_ENABLED_MFA = "security.mfa_enabled",
  SECURITY_DISABLED_MFA = "security.mfa_disabled",
  ACCESS_GRANTED = "access.granted",
  ACCESS_DENIED = "access.denied",
  SETTINGS_CHANGED = "settings.changed",
  DATA_EXPORTED = "data.exported",
}
