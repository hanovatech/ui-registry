import cron, { type ScheduledTask } from 'node-cron';

let initialized = false;
const tasks: ScheduledTask[] = [];

function stopAll() {
  for (const task of tasks) task.stop();
  tasks.length = 0;
}

/**
 * Starts the cron scheduler.
 *
 * Call once at server startup (e.g. in `hooks.server.ts`).
 * Handles graceful shutdown on SIGINT/SIGTERM.
 *
 * Register cron jobs here. Job bodies live in ./jobs/<name>.ts as
 * pure async functions; this file pairs them with their cron expression.
 *
 * import cron from 'node-cron';
 * import { closeStaleTickets } from './jobs/close-stale-tickets';
 * tasks.push(cron.schedule('0 3 * * *', closeStaleTickets));
 */
export function startScheduler() {
  if (initialized) return;
  initialized = true;

  process.on('SIGINT', () => {
    stopAll();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    stopAll();
    process.exit(0);
  });
}
