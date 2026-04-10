import cron, { type ScheduledTask } from 'node-cron';

// Define your jobs here
// import { myJob } from '$lib/scheduler/jobs/my-job';

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
 * Add jobs below using `cron.schedule(expression, handler)`.
 */
export function startScheduler() {
  if (initialized) return;
  initialized = true;

  // Register jobs here:
  // tasks.push(cron.schedule('0 3 1 * *', myJob));

  process.on('SIGINT', () => {
    stopAll();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    stopAll();
    process.exit(0);
  });
}
