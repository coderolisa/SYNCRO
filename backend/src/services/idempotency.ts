import { supabase } from '../config/database';
import logger from '../config/logger';
import crypto from 'crypto';

export interface IdempotencyRecord {
  id: string;
  key: string;
  user_id: string;
  request_hash: string;
  response_status: number;
  response_body: any;
  created_at: string;
  expires_at: string;
}

/**
 * Idempotency service to prevent duplicate operations
 * Uses request hashing and key-based deduplication
 */
export class IdempotencyService {
  private readonly ttlHours = 24; 

  /**
   * Generate idempotency key from request
   */
  generateKey(userId: string, operation: string, payload: any): string {
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
      .substring(0, 16);

    return `${userId}:${operation}:${payloadHash}`;
  }

  /**
   * Check if request is idempotent and return cached response if exists
   */
  async checkIdempotency(
    key: string,
    userId: string,
    requestHash: string
  ): Promise<{ isDuplicate: boolean; cachedResponse?: any }> {
    try {
      // Check for existing idempotency record
      const { data: existing, error } = await supabase
        .from('idempotency_keys')
        .select('*')
        .eq('key', key)
        .eq('user_id', userId)
        .eq('request_hash', requestHash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        // Log but don't throw - idempotency is best-effort
        logger.error('Idempotency check error:', error);
        // Continue on error - don't block the request
        return { isDuplicate: false };
      }

      if (existing) {
        logger.info('Idempotent request detected', { key, userId });
        return {
          isDuplicate: true,
          cachedResponse: {
            status: existing.response_status,
            body: existing.response_body,
            idempotencyKey: key,
          },
        };
      }

      return { isDuplicate: false };
    } catch (error) {
      logger.error('Idempotency check failed:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * Store idempotency record with response
   */
  async storeResponse(
    key: string,
    userId: string,
    requestHash: string,
    responseStatus: number,
    responseBody: any
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.ttlHours);

      const { error } = await supabase.from('idempotency_keys').insert({
        key,
        user_id: userId,
        request_hash: requestHash,
        response_status: responseStatus,
        response_body: responseBody,
        expires_at: expiresAt.toISOString(),
      });

      if (error) {
        // Log but don't throw - idempotency is best-effort
        logger.warn('Failed to store idempotency record:', error);
      }
    } catch (error) {
      logger.error('Idempotency storage failed:', error);
      // Don't throw - idempotency storage failure shouldn't break the request
    }
  }

  /**
   * Hash request payload for idempotency checking
   */
  hashRequest(payload: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  /**
   * Clean up expired idempotency keys (should be run periodically)
   */
  async cleanupExpired(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('idempotency_keys')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        logger.error('Idempotency cleanup error:', error);
        return 0;
      }

      const deletedCount = data?.length || 0;
      logger.info(`Cleaned up ${deletedCount} expired idempotency keys`);
      return deletedCount;
    } catch (error) {
      logger.error('Idempotency cleanup failed:', error);
      return 0;
    }
  }
}

export const idempotencyService = new IdempotencyService();
