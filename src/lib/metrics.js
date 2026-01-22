import * as Sentry from "@sentry/node";
import { logWarn } from "./logger.js";

function metricsEnabled() {
  return Boolean(process.env.SENTRY_DSN && Sentry?.metrics);
}

export function metricIncrement(name, value = 1, tags = {}) {
  if (!metricsEnabled()) return;
  try {
    Sentry.metrics.increment(name, value, { tags });
  } catch (error) {
    logWarn("metricIncrement failed", { name, error });
  }
}

export function metricTiming(name, milliseconds, tags = {}) {
  if (!metricsEnabled()) return;
  try {
    Sentry.metrics.timing(name, milliseconds, { tags });
  } catch (error) {
    logWarn("metricTiming failed", { name, error });
  }
}
