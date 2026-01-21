import express from 'express';
import dotenv from 'dotenv';
import logger from './config/logger';
import { schedulerService } from './services/scheduler';
import { reminderEngine } from './services/reminder-engine';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/reminders/status', (req, res) => {
  const status = schedulerService.getStatus();
  res.json(status);
});

// Manual trigger endpoints (for testing/admin)
app.post('/api/reminders/process', async (req, res) => {
  try {
    await reminderEngine.processReminders();
    res.json({ success: true, message: 'Reminders processed' });
  } catch (error) {
    logger.error('Error processing reminders:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/api/reminders/schedule', async (req, res) => {
  try {
    const daysBefore = req.body.daysBefore || [7, 3, 1];
    await reminderEngine.scheduleReminders(daysBefore);
    res.json({ success: true, message: 'Reminders scheduled' });
  } catch (error) {
    logger.error('Error scheduling reminders:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/api/reminders/retry', async (req, res) => {
  try {
    await reminderEngine.processRetries();
    res.json({ success: true, message: 'Retries processed' });
  } catch (error) {
    logger.error('Error processing retries:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start scheduler
  schedulerService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  schedulerService.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  schedulerService.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

