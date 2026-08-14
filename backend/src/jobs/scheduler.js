const cron = require('node-cron');
const { getCronTimezone } = require('../config/cron');

const scheduledJobs = new Map();

function wrapJobTask(name, task) {
  return async (...args) => {
    try {
      return await task(...args);
    } catch (error) {
      console.error(`[cron] job "${name}" failed`, error);
      return undefined;
    }
  };
}

function scheduleJob({ name, expression, task, options = {} }) {
  if (!name || typeof name !== 'string') {
    throw new Error('scheduleJob requires a job name');
  }

  if (typeof task !== 'function') {
    throw new Error(`scheduleJob "${name}" requires a task function`);
  }

  if (!cron.validate(expression)) {
    throw new Error(`Invalid cron expression for job "${name}": ${expression}`);
  }

  if (scheduledJobs.has(name)) {
    throw new Error(`A job named "${name}" is already scheduled`);
  }

  const scheduledTask = cron.schedule(expression, wrapJobTask(name, task), {
    timezone: getCronTimezone(),
    noOverlap: true,
    ...options,
    name,
  });

  scheduledJobs.set(name, scheduledTask);
  return scheduledTask;
}

function getScheduledJobs() {
  return scheduledJobs;
}

function stopScheduledJobs() {
  for (const task of scheduledJobs.values()) {
    task.stop();
  }
}

module.exports = {
  scheduleJob,
  getScheduledJobs,
  stopScheduledJobs,
};
