import * as Sentry from "@sentry/node";

function metricsEnabled() {
  return Boolean(process.env.SENTRY_DSN && Sentry?.metrics);
}

export function metricIncrement(name, value = 1, tags = {}) {
  if (!metricsEnabled()) return;
  try {
    Sentry.metrics.increment(name, value, { tags });
  } catch (error) {
    console.warn("metricIncrement failed:", name, error);
  }
}

export function metricTiming(name, milliseconds, tags = {}) {
  if (!metricsEnabled()) return;
  try {
    Sentry.metrics.timing(name, milliseconds, { tags });
  } catch (error) {
    console.warn("metricTiming failed:", name, error);
  }
}
