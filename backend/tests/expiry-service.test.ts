import { expiryService } from '../src/services/expiry-service';
import { supabase } from '../src/config/database';

// Mock Supabase client
jest.mock('../src/config/database', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock logger to suppress output during tests
jest.mock('../src/config/logger', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  __esModule: true,
}));

describe('ExpiryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return zeros when no candidates found', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          not: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    });

    const result = await expiryService.processExpiries();
    expect(result).toEqual({ processed: 0, expired: 0, errors: 0 });
  });

  it('should expire subscriptions past their threshold', async () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const candidates = [
      {
        id: 'sub-1',
        user_id: 'user-1',
        name: 'Old Subscription',
        last_used_at: sixtyDaysAgo,
        created_at: ninetyDaysAgo,
        expiry_threshold: 30,
      },
    ];

    // Mock the select query for candidates
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'subscriptions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              not: jest.fn().mockResolvedValue({ data: candidates, error: null }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }),
        };
      }
      if (table === 'notifications') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await expiryService.processExpiries();
    expect(result.processed).toBe(1);
    expect(result.expired).toBe(1);
    expect(result.errors).toBe(0);
  });

  it('should not expire subscriptions within their threshold', async () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const candidates = [
      {
        id: 'sub-1',
        user_id: 'user-1',
        name: 'Active Subscription',
        last_used_at: fiveDaysAgo,
        created_at: ninetyDaysAgo,
        expiry_threshold: 30,
      },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          not: jest.fn().mockResolvedValue({ data: candidates, error: null }),
        }),
      }),
    });

    const result = await expiryService.processExpiries();
    expect(result.processed).toBe(1);
    expect(result.expired).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('should fall back to created_at when last_used_at is null', async () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

    const candidates = [
      {
        id: 'sub-1',
        user_id: 'user-1',
        name: 'Never Used',
        last_used_at: null,
        created_at: sixtyDaysAgo,
        expiry_threshold: 30,
      },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'subscriptions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              not: jest.fn().mockResolvedValue({ data: candidates, error: null }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }),
        };
      }
      if (table === 'notifications') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await expiryService.processExpiries();
    expect(result.processed).toBe(1);
    expect(result.expired).toBe(1);
    expect(result.errors).toBe(0);
  });

  it('should continue processing when one subscription fails', async () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const candidates = [
      {
        id: 'sub-1',
        user_id: 'user-1',
        name: 'Will Fail',
        last_used_at: sixtyDaysAgo,
        created_at: ninetyDaysAgo,
        expiry_threshold: 30,
      },
      {
        id: 'sub-2',
        user_id: 'user-2',
        name: 'Will Succeed',
        last_used_at: sixtyDaysAgo,
        created_at: ninetyDaysAgo,
        expiry_threshold: 30,
      },
    ];

    let updateCallCount = 0;

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'subscriptions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              not: jest.fn().mockResolvedValue({ data: candidates, error: null }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockImplementation(() => {
                updateCallCount++;
                if (updateCallCount === 1) {
                  return Promise.resolve({ error: { message: 'DB error' } });
                }
                return Promise.resolve({ error: null });
              }),
            }),
          }),
        };
      }
      if (table === 'notifications') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await expiryService.processExpiries();
    expect(result.processed).toBe(2);
    expect(result.expired).toBe(1);
    expect(result.errors).toBe(1);
  });
});
