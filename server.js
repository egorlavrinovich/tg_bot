import express from "express";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";

dotenv.config();

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    integrations: [
        // send console.log, console.warn, and console.error calls as logs to Sentry
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
      ],
      // Enable logs to be sent to Sentry
      enableLogs: true,
  });
}

const app = express();
app.use(express.json({ limit: "1mb" }));

const { default: telegramHandler } = await import("./api/telegram.js");
const { default: pingHandler } = await import("./api/ping.js");

app.post("/api/telegram", telegramHandler);
app.get("/api/ping", pingHandler);
app.get("/", (_req, res) => res.status(200).send("OK"));

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
