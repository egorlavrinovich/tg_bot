import express from "express";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";

dotenv.config();

if (process.env.SENTRY_DSN) {
  const integrations = [];
  if (typeof Sentry.consoleLoggingIntegration === "function") {
    integrations.push(
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] })
    );
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    integrations,
    enableLogs: true,
  });

}

const app = express();
app.use(express.json({ limit: "1mb" }));

const { default: telegramHandler } = await import("./api/telegram.js");
const { default: pingHandler } = await import("./api/ping.js");
const { default: bot } = await import("./src/bot/bot.js");
const { sweepExpiredRequests } = await import("./src/lib/autoClose.js");

app.post("/api/telegram", telegramHandler);
app.get("/api/ping", pingHandler);
app.get("/", (_req, res) => res.status(200).send("OK"));

if (process.env.SENTRY_DSN && Sentry.Handlers?.errorHandler) {
  app.use(Sentry.Handlers.errorHandler());
}

const sweepMinutes = Number(process.env.SWEEP_INTERVAL_MINUTES) || 5;
setInterval(() => {
  sweepExpiredRequests(bot);
}, sweepMinutes * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
