import { supabase } from '../config/database';
import logger from '../config/logger';
import { isExpiredByInactivity } from '../utils/expiry';

export interface ExpiryResult {
  processed: number;
  expired: number;
  errors: number;
}

export class ExpiryService {
  /**
   * Process all active subscriptions that have an expiry_threshold set,
   * expiring those that have been inactive beyond their threshold.
   */
  async processExpiries(): Promise<ExpiryResult> {
    logger.info('Processing subscription expiries');

    const result: ExpiryResult = { processed: 0, expired: 0, errors: 0 };

    try {
      // Fetch candidates: active subscriptions with an expiry threshold
      const { data: candidates, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, name, last_used_at, created_at, expiry_threshold')
        .eq('status', 'active')
        .not('expiry_threshold', 'is', null);

      if (error) {
        logger.error('Failed to fetch expiry candidates:', error);
        throw error;
      }

      if (!candidates || candidates.length === 0) {
        logger.info('No expiry candidates found');
        return result;
      }

      logger.info(`Found ${candidates.length} expiry candidates`);
      result.processed = candidates.length;

      for (const sub of candidates) {
        try {
          if (!isExpiredByInactivity(sub.last_used_at, sub.created_at, sub.expiry_threshold)) {
            continue;
          }

          const now = new Date().toISOString();

          // Expire the subscription with status guard to prevent double-expiry
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'expired',
              expired_at: now,
              updated_at: now,
            })
            .eq('id', sub.id)
            .eq('status', 'active');

          if (updateError) {
            logger.error(`Failed to expire subscription ${sub.id}:`, updateError);
            result.errors++;
            continue;
          }

          // Insert notification for the user
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: sub.user_id,
              title: 'Subscription Expired',
              description: `${sub.name} has been automatically expired due to ${sub.expiry_threshold} days of inactivity.`,
              type: 'alert',
              subscription_data: {
                subscription_id: sub.id,
                name: sub.name,
                expired_at: now,
                expiry_threshold: sub.expiry_threshold,
              },
            });

          if (notifError) {
            logger.warn(`Failed to create notification for expired subscription ${sub.id}:`, notifError);
            // Don't count as error — the subscription was still expired successfully
          }

          result.expired++;
          logger.info(`Expired subscription ${sub.id} (${sub.name}) after ${sub.expiry_threshold} days of inactivity`);
        } catch (err) {
          logger.error(`Error processing expiry for subscription ${sub.id}:`, err);
          result.errors++;
        }
      }
    } catch (error) {
      logger.error('Error processing expiries:', error);
      throw error;
    }

    logger.info(`Expiry processing complete: ${result.processed} processed, ${result.expired} expired, ${result.errors} errors`);
    return result;
  }
}

export const expiryService = new ExpiryService();
