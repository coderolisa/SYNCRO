# Reminder & Notification Engine

This document describes the Reminder & Notification Engine implementation for the Synchro backend.

## Overview

The Reminder & Notification Engine is responsible for:
- Scheduling renewal reminders (e.g., 3 days before renewal)
- Sending email notifications
- Sending push notifications
- Implementing retry logic with exponential backoff
- Handling delivery failures gracefully
- Writing reminder events to on-chain logs (blockchain)

## Architecture

### Components

1. **ReminderEngine** (`src/services/reminder-engine.ts`)
   - Orchestrates reminder processing
   - Schedules reminders for subscriptions
   - Processes pending reminders
   - Handles retry logic

2. **EmailService** (`src/services/email-service.ts`)
   - Sends email notifications via SMTP
   - Handles email delivery with retry logic
   - Generates email templates

3. **PushService** (`src/services/push-service.ts`)
   - Sends push notifications via Web Push API
   - Uses VAPID keys for authentication
   - Handles push delivery with retry logic

4. **BlockchainService** (`src/services/blockchain-service.ts`)
   - Logs reminder events to database
   - Writes events to Soroban blockchain (when configured)
   - Tracks transaction hashes and status

5. **SchedulerService** (`src/services/scheduler.ts`)
   - Manages cron jobs for automated processing
   - Schedules daily reminder processing
   - Handles retry processing

6. **Retry Utilities** (`src/utils/retry.ts`)
   - Exponential backoff calculation
   - Retry logic with configurable attempts
   - Error classification (retryable vs non-retryable)

## Database Schema

### reminder_schedules
Tracks scheduled reminders for subscriptions:
- `id`: UUID primary key
- `subscription_id`: Reference to subscription
- `user_id`: Reference to user
- `reminder_date`: Date when reminder should be sent
- `reminder_type`: Type (renewal, trial_expiry, cancellation)
- `days_before`: Days before renewal date
- `status`: pending, sent, failed, cancelled

### notification_deliveries
Tracks delivery attempts for notifications:
- `id`: UUID primary key
- `reminder_schedule_id`: Reference to reminder schedule
- `channel`: email or push
- `status`: pending, sent, failed, retrying
- `attempt_count`: Number of delivery attempts
- `max_attempts`: Maximum retry attempts
- `next_retry_at`: When to retry (if applicable)
- `error_message`: Error details (if failed)

### blockchain_logs
Tracks on-chain events:
- `id`: UUID primary key
- `user_id`: Reference to user
- `event_type`: Type of event
- `event_data`: JSON data
- `transaction_hash`: Blockchain transaction hash
- `status`: pending, confirmed, failed

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Migration

Run the SQL migration to create the required tables:

```sql
-- Run scripts/007_create_reminder_tables.sql on your Supabase instance
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email (required for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@synchro.app

# Push Notifications (optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Blockchain (optional)
SOROBAN_CONTRACT_ADDRESS=your_contract_address
STELLAR_NETWORK_URL=https://soroban-testnet.stellar.org
```

### 4. Generate VAPID Keys (for Push Notifications)

```bash
npx web-push generate-vapid-keys
```

Copy the generated keys to your `.env` file.

### 5. Build and Run

```bash
# Build TypeScript
npm run build

# Run in production
npm start

# Run in development (with auto-reload)
npm run dev
```

## Usage

### Automated Processing

The scheduler automatically runs:
- **Daily at 9 AM UTC**: Process pending reminders
- **Daily at midnight UTC**: Schedule new reminders for upcoming renewals
- **Every 30 minutes**: Process retry deliveries

### Manual Triggers (API Endpoints)

#### Process Reminders
```bash
POST /api/reminders/process
```

Manually trigger reminder processing for today's date.

#### Schedule Reminders
```bash
POST /api/reminders/schedule
Content-Type: application/json

{
  "daysBefore": [7, 3, 1]  // Optional, defaults to [7, 3, 1]
}
```

Manually trigger reminder scheduling.

#### Process Retries
```bash
POST /api/reminders/retry
```

Manually trigger retry processing for failed deliveries.

#### Check Status
```bash
GET /api/reminders/status
```

Get scheduler status.

## Configuration

### Reminder Scheduling

Default reminder days: `[7, 3, 1]` (7 days, 3 days, and 1 day before renewal)

To customize, modify the `ReminderEngine` constructor:

```typescript
const reminderEngine = new ReminderEngine({
  defaultDaysBefore: [14, 7, 3, 1],
  maxRetryAttempts: 5,
});
```

### Retry Logic

- **Default max attempts**: 3
- **Initial delay**: 1 second
- **Max delay**: 30 seconds
- **Multiplier**: 2 (exponential)
- **Jitter**: Enabled (0-20% random variance)

Retry delays:
- Attempt 1: ~1 second
- Attempt 2: ~2 seconds
- Attempt 3: ~4 seconds

### Email Configuration

Supports:
- SMTP servers (Gmail, Outlook, custom)
- SendGrid, Mailgun (via SMTP)
- Custom SMTP configurations

### Push Notifications

Uses Web Push API with VAPID keys. Users must subscribe to push notifications on the frontend.

## Error Handling

### Retryable Errors
- Network timeouts
- Connection errors
- Temporary service errors (5xx)
- Rate limiting (429)

### Non-Retryable Errors
- Invalid email addresses
- Invalid push subscriptions (410, 404)
- Authentication failures
- Invalid configuration

## Blockchain Integration

The service logs reminder events to the database and optionally writes to Soroban blockchain:

1. Event is logged to `blockchain_logs` table (status: pending)
2. If `SOROBAN_CONTRACT_ADDRESS` is configured, event is written to blockchain
3. Transaction hash is stored in database
4. Status is updated to `confirmed` or `failed`

**Note**: The blockchain write implementation is a placeholder. You need to implement actual Soroban contract interaction using `@stellar/stellar-sdk` or a Soroban SDK.

## Monitoring

Check logs for:
- Reminder processing status
- Delivery success/failure rates
- Retry attempts
- Blockchain transaction status

Log files:
- `error.log`: Error-level logs
- `combined.log`: All logs

## Testing

### Test Email Service

```typescript
import { emailService } from './services/email-service';

const result = await emailService.sendReminderEmail(
  'user@example.com',
  {
    title: 'Test Reminder',
    body: 'Test message',
    subscription: { /* subscription data */ },
    reminderType: 'renewal',
    daysBefore: 3,
    renewalDate: new Date().toISOString(),
  }
);
```

### Test Reminder Processing

```typescript
import { reminderEngine } from './services/reminder-engine';

// Process reminders for today
await reminderEngine.processReminders();

// Schedule reminders
await reminderEngine.scheduleReminders([7, 3, 1]);
```

## Future Enhancements

- [ ] User preference management (notification channels, timing)
- [ ] Push subscription storage and management
- [ ] Additional notification channels (SMS, Telegram)
- [ ] Timezone-aware scheduling
- [ ] Notification templates customization
- [ ] Analytics and reporting
- [ ] Complete Soroban contract integration

