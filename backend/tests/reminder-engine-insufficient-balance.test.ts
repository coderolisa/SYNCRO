import { ReminderEngine } from '../src/services/reminder-engine';
import { supabase } from '../src/config/database';
import { emailService } from '../src/services/email-service';
import { pushService } from '../src/services/push-service';
import { userPreferenceService } from '../src/services/user-preference-service';

jest.mock('../src/config/database', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('../src/services/user-preference-service', () => ({
  userPreferenceService: {
    getPreferences: jest.fn(),
  },
}));

jest.mock('../src/services/email-service', () => ({
  emailService: {
    sendReminderEmail: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('../src/services/push-service', () => ({
  pushService: {
    sendPushNotification: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe('ReminderEngine insufficient balance alert', () => {
  let engine: ReminderEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new ReminderEngine();
  });

  it('sends a critical balance alert when wallet balance is lower than the next payment', async () => {
    const budgetRows = [{ user_id: 'user-123', budget_limit: 5.0 }];
    const subscriptions = [
      {
        id: 'sub-123',
        user_id: 'user-123',
        name: 'Spotify',
        provider: 'Spotify',
        category: 'Entertainment',
        price: 9.99,
        billing_cycle: 'monthly',
        status: 'active',
        next_billing_date: '2026-05-01T00:00:00Z',
        logo_url: null,
        website_url: null,
        renewal_url: null,
        notes: null,
        tags: [],
        expired_at: null,
        active_until: null,
        is_trial: false,
        trial_ends_at: null,
        trial_converts_to_price: null,
        credit_card_required: false,
        created_at: '2026-04-01T00:00:00Z',
        updated_at: '2026-04-01T00:00:00Z',
      },
    ];

    const mockGetPreferences = (userPreferenceService.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      notification_channels: ['email', 'push'],
      reminder_timing: [7, 3, 1],
      email_opt_ins: { marketing: false, reminders: true, updates: true },
      automation_flags: { auto_renew: false, auto_retry: true },
      risk_notification_threshold: 'HIGH',
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      quiet_hours_timezone: 'UTC',
      critical_alerts_only: false,
      updated_at: '2026-04-01T00:00:00Z',
    });

    const databaseMock = (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'monthly_budgets') {
        return {
          select: () => ({
            is: () => Promise.resolve({ data: budgetRows, error: null }),
          }),
        };
      }

      if (table === 'subscriptions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: subscriptions, error: null }),
            }),
          }),
        };
      }

      return { select: () => ({ eq: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) }) };
    });

    const userProfile = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      timezone: 'UTC',
      currency: 'USD',
    };

    jest.spyOn(engine as any, 'getUserProfile').mockResolvedValue(userProfile);
    jest.spyOn(engine as any, 'getPushSubscription').mockResolvedValue({
      endpoint: 'https://example.com/push',
      keys: { p256dh: 'key', auth: 'auth' },
    });

    await engine.checkInsufficientBalance();

    expect(databaseMock).toHaveBeenCalledWith('monthly_budgets');
    expect(databaseMock).toHaveBeenCalledWith('subscriptions');
    expect(mockGetPreferences).toHaveBeenCalledWith('user-123');
    expect(emailService.sendReminderEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        body: 'Wallet balance ($5.00) is insufficient for Spotify ($9.99).',
        priority: 'critical',
      }),
      { maxAttempts: 3 },
    );
    expect(pushService.sendPushNotification).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'https://example.com/push' }),
      expect.objectContaining({
        body: 'Wallet balance ($5.00) is insufficient for Spotify ($9.99).',
        priority: 'critical',
      }),
      { maxAttempts: 3 },
    );
  });
});
