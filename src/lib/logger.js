import * as Sentry from "@sentry/node";

function hasSentryLogger() {
  return Boolean(process.env.SENTRY_DSN && Sentry?.logger);
}

function logWithFallback(level, message, data) {
  if (hasSentryLogger() && typeof Sentry.logger[level] === "function") {
    Sentry.logger[level](message, data);
    return;
  }

  const fallback = console[level] ? console[level] : console.log;
  fallback(message, data || "");
}

export function logInfo(message, data) {
  logWithFallback("info", message, data);
}

export function logWarn(message, data) {
  logWithFallback("warn", message, data);
}

export function logError(message, error, data) {
  logWithFallback("error", message, { error, ...data });
}
