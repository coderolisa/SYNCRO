import { supabase } from '../config/database';
import logger from '../config/logger';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Database transaction wrapper
 * Provides atomic operations with rollback on error
 * 
 * Note: Supabase PostgREST doesn't support traditional transactions,
 * so we use a compensating actions pattern for multi-step operations.
 * For single operations, we rely on database constraints and RLS.
 */
export class DatabaseTransaction {
  /**
   * Execute a function with the Supabase client
   * For single operations, this provides error handling
   * For multi-step operations, use executeWithCompensation
   */
  static async execute<T>(
    callback: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    try {
      return await callback(supabase);
    } catch (error) {
      logger.error('Database operation error:', error);
      throw error;
    }
  }

  /**
   * Execute multiple operations with all-or-nothing semantics
   * Uses a compensating actions pattern for rollback
   */
  static async executeWithCompensation<T>(
    operations: Array<{
      execute: () => Promise<any>;
      compensate?: () => Promise<void>;
    }>
  ): Promise<T[]> {
    const results: any[] = [];
    const executedOperations: Array<{ compensate?: () => Promise<void> }> = [];

    try {
      for (const op of operations) {
        const result = await op.execute();
        results.push(result);
        executedOperations.push(op);
      }
      return results as T[];
    } catch (error) {
      // Rollback in reverse order
      logger.error('Transaction failed, rolling back:', error);
      for (let i = executedOperations.length - 1; i >= 0; i--) {
        const op = executedOperations[i];
        if (op.compensate) {
          try {
            await op.compensate();
          } catch (rollbackError) {
            logger.error('Compensation failed:', rollbackError);
          }
        }
      }
      throw error;
    }
  }
}
