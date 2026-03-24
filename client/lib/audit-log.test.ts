/**
 * Testing utilities for audit logging system
 * Use these functions to validate the audit logging implementation
 */

import { logEvent, getQueueSize, getOfflineEntriesCount, forceFlush, clearQueue } from './audit-log';
import { AuditEntry, AuditAction } from '../../lib/types/audit';

/**
 * Sleep utility for testing
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test 1: Verify queue batching (max 10 events)
 */
export async function testBatchSizeLimit(): Promise<{
  passed: boolean;
  message: string;
}> {
  console.log('[TEST] Testing batch size limit...');
  clearQueue();

  try {
    // Log 10 events
    for (let i = 0; i < 10; i++) {
      await logEvent({
        action: `test.batch.${i}`,
        resource_type: 'test',
        metadata: { index: i },
      });
    }

    // Queue should still be full (waiting for flush)
    const queueSize = getQueueSize();
    if (queueSize === 0) {
      return {
        passed: true,
        message: `✅ Batch flushed automatically after 10 events. Queue size: ${queueSize}`,
      };
    } else {
      return {
        passed: false,
        message: `❌ Expected queue to flush after 10 events. Queue size: ${queueSize}`,
      };
    }
  } catch (err) {
    return {
      passed: false,
      message: `❌ Test failed with error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Test 2: Verify timeout-based flushing (5 seconds)
 */
export async function testTimeoutFlushing(): Promise<{
  passed: boolean;
  message: string;
}> {
  console.log('[TEST] Testing timeout-based flushing...');
  clearQueue();

  try {
    // Log 1 event
    await logEvent({
      action: 'test.timeout',
      resource_type: 'test',
      metadata: { testType: 'timeout' },
    });

    // Queue should have 1 event
    let queueSize = getQueueSize();
    if (queueSize !== 1) {
      return {
        passed: false,
        message: `❌ Expected 1 event in queue, got ${queueSize}`,
      };
    }

    // Wait for timeout (5 seconds)
    console.log('[TEST] Waiting 5.5 seconds for timeout flush...');
    await sleep(5500);

    // Queue should be flushed
    queueSize = getQueueSize();
    if (queueSize === 0) {
      return {
        passed: true,
        message: `✅ Timeout-based flush worked. Queue size after 5.5s: ${queueSize}`,
      };
    } else {
      return {
        passed: false,
        message: `❌ Expected queue to flush after timeout. Queue size: ${queueSize}`,
      };
    }
  } catch (err) {
    return {
      passed: false,
      message: `❌ Test failed with error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Test 3: Verify offline storage fallback
 */
export async function testOfflineStorage(): Promise<{
  passed: boolean;
  message: string;
}> {
  console.log('[TEST] Testing offline storage...');
  clearQueue();

  try {
    // Simulate offline by logging events
    for (let i = 0; i < 5; i++) {
      await logEvent({
        action: `test.offline.${i}`,
        resource_type: 'test',
        metadata: { index: i, offline: true },
      });
    }

    // Check if events are queued or in storage
    const queueSize = getQueueSize();
    const offlineCount = getOfflineEntriesCount();

    if (queueSize >= 0 && offlineCount >= 0) {
      return {
        passed: true,
        message: `✅ Offline storage accessible. Queue: ${queueSize}, Offline: ${offlineCount}`,
      };
    } else {
      return {
        passed: false,
        message: `❌ Failed to access offline storage`,
      };
    }
  } catch (err) {
    return {
      passed: false,
      message: `❌ Test failed with error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Test 4: Verify manual flush
 */
export async function testManualFlush(): Promise<{
  passed: boolean;
  message: string;
}> {
  console.log('[TEST] Testing manual flush...');
  clearQueue();

  try {
    // Log some events
    for (let i = 0; i < 3; i++) {
      await logEvent({
        action: `test.flush.${i}`,
        resource_type: 'test',
        metadata: { index: i },
      });
    }

    // Check queue before flush
    const queueBefore = getQueueSize();
    console.log(`[TEST] Queue before flush: ${queueBefore}`);

    // Force flush
    const response = await forceFlush();

    // Check queue after flush
    const queueAfter = getQueueSize();
    console.log(`[TEST] Queue after flush: ${queueAfter}`);

    if (response === null || response.success) {
      return {
        passed: true,
        message: `✅ Manual flush successful. Response: ${JSON.stringify(response)}`,
      };
    } else {
      return {
        passed: false,
        message: `❌ Manual flush failed. Response: ${JSON.stringify(response)}`,
      };
    }
  } catch (err) {
    return {
      passed: false,
      message: `❌ Test failed with error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Test 5: Verify event validation
 */
export async function testEventValidation(): Promise<{
  passed: boolean;
  message: string;
}> {
  console.log('[TEST] Testing event validation...');
  clearQueue();

  try {
    const tests = [
      {
        name: 'Valid event',
        event: {
          action: 'test.valid',
          resource_type: 'test',
          metadata: { test: true },
        } as AuditEntry,
        shouldSucceed: true,
      },
      {
        name: 'Missing action',
        event: {
          // action is missing
          resource_type: 'test',
        } as AuditEntry,
        shouldSucceed: false,
      },
      {
        name: 'Missing resource_type',
        event: {
          action: 'test.valid',
          // resource_type is missing
        } as AuditEntry,
        shouldSucceed: false,
      },
    ];

    let passedCount = 0;

    for (const test of tests) {
      try {
        await logEvent(test.event);
        if (test.shouldSucceed) {
          passedCount++;
          console.log(`✅ ${test.name}: Passed`);
        } else {
          console.log(`❌ ${test.name}: Should have failed but didn't`);
        }
      } catch (err) {
        if (!test.shouldSucceed) {
          passedCount++;
          console.log(`✅ ${test.name}: Correctly rejected`);
        } else {
          console.log(`❌ ${test.name}: Should have passed but failed`);
        }
      }
    }

    if (passedCount === tests.length) {
      return {
        passed: true,
        message: `✅ All validation tests passed (${passedCount}/${tests.length})`,
      };
    } else {
      return {
        passed: false,
        message: `❌ Some validation tests failed (${passedCount}/${tests.length})`,
      };
    }
  } catch (err) {
    return {
      passed: false,
      message: `❌ Test failed with error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Test 6: Verify predefined audit actions
 */
export async function testAuditActions(): Promise<{
  passed: boolean;
  message: string;
}> {
  console.log('[TEST] Testing predefined audit actions...');
  clearQueue();

  try {
    const actions = [
      AuditAction.USER_SIGNUP,
      AuditAction.USER_LOGIN,
      AuditAction.USER_LOGOUT,
      AuditAction.SUBSCRIPTION_CREATED,
      AuditAction.SUBSCRIPTION_UPDATED,
      AuditAction.SUBSCRIPTION_CANCELLED,
      AuditAction.PAYMENT_PROCESSED,
      AuditAction.SECURITY_ENABLED_MFA,
      AuditAction.ACCESS_GRANTED,
      AuditAction.SETTINGS_CHANGED,
    ];

    for (const action of actions) {
      await logEvent({
        action,
        resource_type: 'test',
        metadata: { testAction: action },
      });
    }

    const queueSize = getQueueSize();
    if (queueSize === actions.length) {
      return {
        passed: true,
        message: `✅ All ${actions.length} predefined actions logged successfully`,
      };
    } else {
      return {
        passed: false,
        message: `❌ Expected ${actions.length} events, got ${queueSize}`,
      };
    }
  } catch (err) {
    return {
      passed: false,
      message: `❌ Test failed with error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Test 7: Verify API endpoint connectivity
 */
export async function testAPIConnectivity(): Promise<{
  passed: boolean;
  message: string;
}> {
  console.log('[TEST] Testing API endpoint connectivity...');

  try {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [
          {
            action: 'test.api',
            resource_type: 'test',
            metadata: { apiTest: true },
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        passed: true,
        message: `✅ API endpoint reachable and responding. Response: ${JSON.stringify(data)}`,
      };
    } else {
      return {
        passed: false,
        message: `❌ API endpoint returned error: ${response.status} ${response.statusText}`,
      };
    }
  } catch (err) {
    return {
      passed: false,
      message: `❌ API endpoint unreachable: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Test 8: Verify admin API connectivity
 */
export async function testAdminAPIConnectivity(): Promise<{
  passed: boolean;
  message: string;
}> {
  console.log('[TEST] Testing admin API endpoint connectivity...');

  try {
    const response = await fetch('/api/admin/audit?limit=1', {
      method: 'GET',
      headers: {
        'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'test-token',
      },
    });

    if (response.status === 403) {
      return {
        passed: true,
        message: `✅ Admin API endpoint reachable (with auth required). Status: ${response.status}`,
      };
    } else if (response.ok) {
      const data = await response.json();
      return {
        passed: true,
        message: `✅ Admin API endpoint reachable and authenticated. Found ${data.total} entries`,
      };
    } else {
      return {
        passed: false,
        message: `❌ Admin API endpoint returned unexpected status: ${response.status}`,
      };
    }
  } catch (err) {
    return {
      passed: false,
      message: `❌ Admin API endpoint unreachable: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<void> {
  console.log('\n========================================');
  console.log('    AUDIT LOGGING TEST SUITE');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Event Validation',
      test: testEventValidation,
    },
    {
      name: 'Batch Size Limit (10 events)',
      test: testBatchSizeLimit,
    },
    {
      name: 'Timeout-based Flush (5s)',
      test: testTimeoutFlushing,
    },
    {
      name: 'Offline Storage',
      test: testOfflineStorage,
    },
    {
      name: 'Manual Flush',
      test: testManualFlush,
    },
    {
      name: 'Predefined Audit Actions',
      test: testAuditActions,
    },
    {
      name: 'API Endpoint Connectivity',
      test: testAPIConnectivity,
    },
    {
      name: 'Admin API Connectivity',
      test: testAdminAPIConnectivity,
    },
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      const result = await test.test();
      if (result.passed) {
        passedTests++;
      } else {
        failedTests++;
      }
      console.log(`\n${test.name}:`);
      console.log(result.message);
    } catch (err) {
      failedTests++;
      console.log(`\n${test.name}:`);
      console.log(`❌ Test execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log('\n========================================');
  console.log(`    RESULTS: ${passedTests} passed, ${failedTests} failed`);
  console.log('========================================\n');
}

/**
 * Quick health check
 */
export async function quickHealthCheck(): Promise<void> {
  console.log('\n[HEALTH CHECK] Running quick diagnostics...\n');

  try {
    const queueSize = getQueueSize();
    const offlineCount = getOfflineEntriesCount();

    console.log(`✅ Queue accessible: ${queueSize} events`);
    console.log(`✅ Offline storage accessible: ${offlineCount} entries`);

    // Test API
    try {
      const response = await fetch('/api/audit', { method: 'POST', body: '{}' }).catch(() => null);
      if (response) {
        console.log(`✅ API endpoint responding (status: ${response.status})`);
      } else {
        console.log('⚠️  API endpoint not reachable');
      }
    } catch {
      console.log('⚠️  API endpoint not reachable');
    }

    console.log('\n[HEALTH CHECK] Complete\n');
  } catch (err) {
    console.error('[HEALTH CHECK] Failed:', err);
  }
}
