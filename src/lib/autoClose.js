import { findRequestById, closeRequestById, completeRequestById } from "../models/Request.js";
import { logWarn, logError } from "./logger.js";

const timers = global.requestTimers || new Map();
global.requestTimers = timers;

function minutesToMs(value, fallback) {
  const num = Number(value);
  if (Number.isFinite(num) && num > 0) return num * 60 * 1000;
  return fallback * 60 * 1000;
}

function getConfig() {
  return {
    firstReminderMs: minutesToMs(process.env.REMINDER_MINUTES, 30),
    repeatReminderMs: minutesToMs(process.env.REMINDER_REPEAT_MINUTES, 30),
    autoCloseMs: minutesToMs(process.env.AUTO_CLOSE_MINUTES, 60),
  };
}

function setTimer(requestId, key, timerId) {
  const entry = timers.get(requestId) || {};
  entry[key] = timerId;
  timers.set(requestId, entry);
}

export function cancelAutoClose(requestId) {
  const entry = timers.get(requestId);
  if (!entry) return;
  if (entry.reminder) clearTimeout(entry.reminder);
  if (entry.autoClose) clearTimeout(entry.autoClose);
  timers.delete(requestId);
}

export function scheduleAutoClose(requestId, bot) {
  cancelAutoClose(requestId);
  const { firstReminderMs, autoCloseMs } = getConfig();

  const reminder = setTimeout(async () => {
    try {
      const request = await findRequestById(requestId);
      if (!request || request.status !== "active") return;

      await bot.sendMessage(
        request.telegram_id,
        "Вы нашли подходящего специалиста?",
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Нет", callback_data: `auto_no_${requestId}` },
                { text: "Закрыть заявку", callback_data: `auto_close_${requestId}` },
                { text: "Да", callback_data: `auto_done_${requestId}` },
              ],
            ],
          },
        }
      );
    } catch (error) {
      logError("scheduleAutoClose reminder error", error, { requestId });
    }
  }, firstReminderMs);

  const autoClose = setTimeout(async () => {
    try {
      const request = await closeRequestById(requestId);
      if (!request) return;
      await bot.sendMessage(
        request.telegram_id,
        "Заявка автоматически закрыта, так как вы не ответили."
      );
    } catch (error) {
      logError("scheduleAutoClose autoClose error", error, { requestId });
    } finally {
      cancelAutoClose(requestId);
    }
  }, autoCloseMs);

  setTimer(requestId, "reminder", reminder);
  setTimer(requestId, "autoClose", autoClose);
}

export async function handleAutoResponse(action, requestId, bot) {
  const request = await findRequestById(requestId);
  if (!request || request.status !== "active") return;

  if (action === "no") {
    const { repeatReminderMs } = getConfig();
    const reminder = setTimeout(async () => {
      try {
        const latest = await findRequestById(requestId);
        if (!latest || latest.status !== "active") return;
        await bot.sendMessage(
          latest.telegram_id,
          "Вы нашли подходящего специалиста?",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "Нет", callback_data: `auto_no_${requestId}` },
                  { text: "Закрыть заявку", callback_data: `auto_close_${requestId}` },
                  { text: "Да", callback_data: `auto_done_${requestId}` },
                ],
              ],
            },
          }
        );
      } catch (error) {
        logError("handleAutoResponse repeat reminder error", error, { requestId });
      }
    }, repeatReminderMs);
    setTimer(requestId, "reminder", reminder);
    return;
  }

  if (action === "close") {
    const closed = await closeRequestById(requestId);
    if (closed) {
      await bot.sendMessage(
        closed.telegram_id,
        "Заявка закрыта. Если нужно — можете создать новую."
      );
    }
    cancelAutoClose(requestId);
    return;
  }

  if (action === "done") {
    const done = await completeRequestById(requestId);
    if (done) {
      await bot.sendMessage(
        done.telegram_id,
        "Отлично! Отмечаю заявку как выполненную."
      );
    }
    cancelAutoClose(requestId);
  }
}
