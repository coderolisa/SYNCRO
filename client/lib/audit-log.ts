/**
 * Client-side audit logging system with batching and offline support
 * Features:
 * - Batches audit events before sending to backend (max 10 events or 5 seconds)
 * - Automatically flushes queue on page unload
 * - Falls back to localStorage for offline scenarios
 * - Validates events before sending
 */

import { AuditEntry, BatchAuditRequest, AuditLogResponse } from '../../lib/types/audit';

// Constants
const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const STORAGE_KEY_PREFIX = 'audit_';
const STORAGE_QUEUE_KEY = 'audit_queue';

// Queue management
let auditQueue: AuditEntry[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let batchId = generateBatchId();

/**
 * Generate a unique batch ID for tracking
 */
function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current user's IP address from metadata (client can't access server IP)
 */
async function getUserIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
}

/**
 * Get browser user agent
 */
function getUserAgent(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent;
  }
  return 'Unknown';
}

/**
 * Validate audit entry before queueing
 */
function validateEntry(entry: AuditEntry): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!entry.action || typeof entry.action !== 'string') {
    errors.push('action is required and must be a string');
  }

  if (!entry.resource_type || typeof entry.resource_type !== 'string') {
    errors.push('resource_type is required and must be a string');
  }

  if (entry.resource_id && typeof entry.resource_id !== 'string') {
    errors.push('resource_id must be a string');
  }

  if (entry.metadata && typeof entry.metadata !== 'object') {
    errors.push('metadata must be an object');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Save entry to localStorage as offline fallback
 */
function saveToLocalStorage(entry: AuditEntry): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const timestamp = Date.now();
    const key = `${STORAGE_KEY_PREFIX}${timestamp}`;
    window.localStorage.setItem(key, JSON.stringify(entry));

    // Keep track of all stored entries for potential replay
    const queueString = window.localStorage.getItem(STORAGE_QUEUE_KEY) || '[]';
    const queue = JSON.parse(queueString);
    queue.push({ key, timestamp });

    // Keep only last 1000 entries to prevent storage explosion
    if (queue.length > 1000) {
      const removed = queue.shift();
      window.localStorage.removeItem(removed.key);
    }

    window.localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save audit log to localStorage:', err);
  }
}

/**
 * Retrieve offline entries from localStorage
 */
function getOfflineEntries(): AuditEntry[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    const queueString = window.localStorage.getItem(STORAGE_QUEUE_KEY) || '[]';
    const queue = JSON.parse(queueString);
    const entries: AuditEntry[] = [];

    for (const item of queue) {
      const entry = window.localStorage.getItem(item.key);
      if (entry) {
        entries.push(JSON.parse(entry));
      }
    }

    return entries;
  } catch (err) {
    console.error('Failed to retrieve offline audit entries:', err);
    return [];
  }
}

/**
 * Clear offline entries from localStorage after sync
 */
function clearOfflineEntries(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const queueString = window.localStorage.getItem(STORAGE_QUEUE_KEY) || '[]';
    const queue = JSON.parse(queueString);

    for (const item of queue) {
      window.localStorage.removeItem(item.key);
    }

    window.localStorage.removeItem(STORAGE_QUEUE_KEY);
  } catch (err) {
    console.error('Failed to clear offline audit entries:', err);
  }
}

/**
 * Send batch of audit events to backend with retry logic
 */
async function sendBatch(
  events: AuditEntry[],
  retryCount = 0
): Promise<AuditLogResponse | null> {
  if (events.length === 0) {
    return null;
  }

  const request: BatchAuditRequest = {
    events,
    batchId,
  };

  try {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: AuditLogResponse = await response.json();

    if (data.success) {
      console.log(
        `[Audit] Batch ${batchId} sent successfully. Stored: ${data.storedCount}, Failed: ${data.failedCount}`
      );
      // Generate new batch ID for next batch
      batchId = generateBatchId();
      return data;
    } else {
      throw new Error(`Backend rejected batch: ${data.message}`);
    }
  } catch (err) {
    console.error(`[Audit] Failed to send batch (attempt ${retryCount + 1}/${MAX_RETRIES}):`, err);

    // Retry logic with exponential backoff
    if (retryCount < MAX_RETRIES - 1) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return sendBatch(events, retryCount + 1);
    }

    // If all retries failed, save to localStorage as fallback
    console.warn('[Audit] Batch send failed, storing to localStorage as fallback');
    events.forEach(saveToLocalStorage);

    return null;
  }
}

/**
 * Flush pending audit queue to backend
 */
export async function flushAuditQueue(): Promise<AuditLogResponse | null> {
  // Clear any pending timeout
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (auditQueue.length === 0) {
    return null;
  }

  // Get offline entries to include in batch
  const offlineEntries = getOfflineEntries();
  const allEntries = [...offlineEntries, ...auditQueue];

  // Clear queue and offline storage
  auditQueue = [];
  if (offlineEntries.length > 0) {
    clearOfflineEntries();
  }

  // Send batch
  const response = await sendBatch(allEntries);
  return response;
}

/**
 * Schedule a flush if one isn't already scheduled
 */
function scheduleFlush(): void {
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushAuditQueue();
    }, BATCH_TIMEOUT);
  }
}

/**
 * Log a single audit event
 * This function is called by the application whenever an auditable action occurs
 */
export async function logEvent(entry: AuditEntry): Promise<void> {
  // Validate entry
  const validation = validateEntry(entry);
  if (!validation.valid) {
    console.error('[Audit] Invalid entry:', validation.errors);
    return;
  }

  // Enrich entry with client information
  const enrichedEntry: AuditEntry = {
    ...entry,
    user_agent: entry.user_agent || getUserAgent(),
    timestamp: entry.timestamp || Date.now(),
  };

  // Queue the event
  auditQueue.push(enrichedEntry);

  console.log(`[Audit] Event queued: ${entry.action} (queue size: ${auditQueue.length})`);

  // Check if we should flush immediately
  if (auditQueue.length >= BATCH_SIZE) {
    console.log(`[Audit] Queue reached batch size, flushing...`);
    await flushAuditQueue();
  } else {
    // Schedule flush if not already scheduled
    scheduleFlush();
  }
}

/**
 * Set up page unload listener to flush pending events
 */
function setupUnloadListener(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const flushOnUnload = async () => {
    if (auditQueue.length > 0) {
      console.log('[Audit] Page unloading, flushing pending events...');
      // Using sendBeacon for reliable delivery on page unload
      const offlineEntries = getOfflineEntries();
      const allEntries = [...offlineEntries, ...auditQueue];

      const beacon = navigator.sendBeacon(
        '/api/audit',
        JSON.stringify({
          events: allEntries,
          batchId,
        } as BatchAuditRequest)
      );

      if (beacon) {
        console.log('[Audit] Page unload beacon sent');
      } else {
        console.warn('[Audit] Beacon failed, events stored to localStorage');
        allEntries.forEach(saveToLocalStorage);
      }
    }
  };

  window.addEventListener('beforeunload', flushOnUnload);
  window.addEventListener('unload', flushOnUnload);
}

/**
 * Initialize the audit logging system
 * Should be called once during application startup
 */
export function initializeAuditLogging(): void {
  console.log('[Audit] Initializing audit logging system');
  setupUnloadListener();

  // Attempt to flush any offline entries on startup
  const offlineEntries = getOfflineEntries();
  if (offlineEntries.length > 0) {
    console.log(`[Audit] Found ${offlineEntries.length} offline entries, attempting to sync...`);
    flushAuditQueue();
  }
}

/**
 * Manually trigger a flush (useful for testing or explicit control)
 */
export async function forceFlush(): Promise<AuditLogResponse | null> {
  console.log('[Audit] Force flush triggered');
  return flushAuditQueue();
}

/**
 * Get current queue size (useful for monitoring)
 */
export function getQueueSize(): number {
  return auditQueue.length;
}

/**
 * Get offline entries count (useful for monitoring)
 */
export function getOfflineEntriesCount(): number {
  return getOfflineEntries().length;
}

/**
 * Clear the queue (use with caution, for testing/debugging only)
 */
export function clearQueue(): void {
  auditQueue = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}
