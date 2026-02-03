import TelegramBot from "node-telegram-bot-api";
import * as Sentry from "@sentry/node";
import { logError, logWarn } from "../lib/logger.js";
import { handleAutoResponse } from "../lib/autoClose.js";
import { handleStart } from "../handlers/start.js";
import { handleRole } from "../handlers/role.js";
import { handleClientMessage } from "../handlers/customer/clientMessage.js";
import { handleOrder } from "../handlers/specialist/handleOrder.js";
import { closeOrder } from "../handlers/customer/closeOrder.js";
import { performOrder } from "../handlers/customer/performOrder.js";
import { reviewCandidat } from "../handlers/customer/reviewCandidat.js";
import { handleSpecialistCategory } from "../handlers/specialist/handleSpecialistCategory.js";
import { handleSpecialistConfirm } from "../handlers/specialist/handleSpecialistConfirm.js";
import { handleResendInvites } from "../handlers/specialist/handleResendInvites.js";
import { handleClientCategorySelect } from "../handlers/handleClientCategorySelect.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

// Включаем polling, если задано USE_POLLING=true
if (process.env.USE_POLLING === "true" && !global.pollingStarted) {
  bot.startPolling();
  global.pollingStarted = true;
}

// Безопасный вызов answerCallbackQuery, чтобы не падать на "query is too old"
export async function safeAnswerCallbackQuery(bot, query, options = {}) {
  if (!query?.id) return;
  try {
    await bot.answerCallbackQuery(query.id, options);
  } catch (e) {
    // Ошибка 400 "query is too old" от Telegram — логируем и продолжаем
    if (
      e?.response?.body?.description &&
      e.response.body.description.includes("query is too old")
    ) {
      logWarn("Ignored old callback_query", {
        description: e.response.body.description,
      });
      return;
    }
    logError("answerCallbackQuery error", e);
  }
}

// Безопасные обёртки для редактирования сообщений — игнорируют 400 "message is not modified"
export async function safeEditMessageText(bot, text, options) {
  try {
    await bot.editMessageText(text, options);
  } catch (e) {
    if (
      e?.response?.body?.description &&
      e.response.body.description.includes("message is not modified")
    ) {
      logWarn("Ignored editMessageText error", {
        description: e.response.body.description,
      });
      return;
    }
    if (
      e?.response?.body?.description &&
      e.response.body.description.includes("message to edit not found")
    ) {
      logWarn("Ignored editMessageText error", {
        description: e.response.body.description,
      });
      return;
    }
    logError("editMessageText error", e);
  }
}

export async function safeEditMessageReplyMarkup(bot, replyMarkup, options) {
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await bot.editMessageReplyMarkup(replyMarkup, options);
      return;
    } catch (e) {
      if (
        e?.response?.body?.description &&
        e.response.body.description.includes("message is not modified")
      ) {
        logWarn("Ignored editMessageReplyMarkup error", {
          description: e.response.body.description,
        });
        return;
      }
      if (
        e?.response?.body?.description &&
        e.response.body.description.includes("message to edit not found")
      ) {
        logWarn("Ignored editMessageReplyMarkup error", {
          description: e.response.body.description,
        });
        return;
      }

      const isReset =
        e?.code === "ECONNRESET" ||
        e?.cause?.code === "ECONNRESET" ||
        String(e?.message || "").includes("socket hang up");

      if (isReset && attempt < maxAttempts) {
        const delayMs = 250 * attempt;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      logError("editMessageReplyMarkup error", e);
      return;
    }
  }
}

export async function notifyUserError(bot, chatId) {
  if (!chatId) return;
  try {
    await bot.sendMessage(
      chatId,
      "Произошла ошибка. Попробуйте ещё раз или вернитесь в главное меню.",
      {
        reply_markup: {
          inline_keyboard: [[{ text: "🏠 Главное меню", callback_data: "menu" }]],
        },
      }
    );
  } catch (e) {
    logError("notifyUserError failed", e);
  }
}

bot.onText(/\/start/, async (msg) => {
  try {
    await handleStart(bot, msg);
  } catch (error) {
    logError("handleStart error", error);
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    await notifyUserError(bot, msg?.chat?.id);
  }
});

bot.on("callback_query", async (query) => {
  try {
    if (!query?.data) return;
    if (query.data.startsWith("role_")) return handleRole(bot, query);
    if (query.data.startsWith("cat_"))
      return handleClientCategorySelect(bot, query);
    if (query.data.startsWith("take_order")) return handleOrder(bot, query);
    if (query.data.startsWith("close_order")) return closeOrder(bot, query);
    if (query.data.startsWith("menu")) {
      await safeAnswerCallbackQuery(bot, query);
      return handleStart(bot, query);
    }
    if (query.data.startsWith("perform_order")) return performOrder(bot, query);
    if (query.data.startsWith("auto_no_")) {
      const requestId = Number(query.data.replace("auto_no_", ""));
      if (Number.isFinite(requestId)) {
        await handleAutoResponse("no", requestId, bot);
      }
      return;
    }
    if (query.data.startsWith("auto_close_")) {
      const requestId = Number(query.data.replace("auto_close_", ""));
      if (Number.isFinite(requestId)) {
        await handleAutoResponse("close", requestId, bot);
      }
      return;
    }
    if (query.data.startsWith("auto_done_")) {
      const requestId = Number(query.data.replace("auto_done_", ""));
      if (Number.isFinite(requestId)) {
        await handleAutoResponse("done", requestId, bot);
      }
      return;
    }
    if (query.data.startsWith("review")) return reviewCandidat(bot, query);
    if (query.data.startsWith("spec_cat_"))
      return handleSpecialistCategory(bot, query);
    if (query.data === "spec_confirm") return handleSpecialistConfirm(bot, query);
    if (query.data === "resend_invites") return handleResendInvites(bot, query);
  } catch (error) {
    logError("callback_query handler error", error, { data: query?.data });
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    await notifyUserError(bot, query?.message?.chat?.id || query?.from?.id);
  }
});

bot.on("message", async (msg) => {
  try {
    await handleClientMessage(bot, msg);
  } catch (error) {
    logError("handleClientMessage error", error);
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    await notifyUserError(bot, msg?.chat?.id);
  }
});

export default bot;
