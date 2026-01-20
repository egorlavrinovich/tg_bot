import TelegramBot from "node-telegram-bot-api";
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
      console.warn("Ignored old callback_query:", e.response.body.description);
      return;
    }
    console.error("answerCallbackQuery error:", e);
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
      console.warn("Ignored editMessageText error:", e.response.body.description);
      return;
    }
    console.error("editMessageText error:", e);
  }
}

export async function safeEditMessageReplyMarkup(bot, replyMarkup, options) {
  try {
    await bot.editMessageReplyMarkup(replyMarkup, options);
  } catch (e) {
    if (
      e?.response?.body?.description &&
      e.response.body.description.includes("message is not modified")
    ) {
      console.warn(
        "Ignored editMessageReplyMarkup error:",
        e.response.body.description
      );
      return;
    }
    console.error("editMessageReplyMarkup error:", e);
  }
}

bot.onText(/\/start/, (msg) => handleStart(bot, msg));

bot.on("callback_query", async (query) => {
  if (!query?.data) return;
  if (query.data.startsWith("role_")) return handleRole(bot, query);
  if (query.data.startsWith("cat_"))
    return handleClientCategorySelect(bot, query);
  if (query.data.startsWith("take_order")) return handleOrder(bot, query);
  if (query.data.startsWith("close_order")) return closeOrder(bot, query);
  if (query.data.startsWith("menu")) return handleStart(bot, query);
  if (query.data.startsWith("perform_order")) return performOrder(bot, query);
  if (query.data.startsWith("review")) return reviewCandidat(bot, query);
  if (query.data.startsWith("spec_cat_"))
    return handleSpecialistCategory(bot, query);
  if (query.data === "spec_confirm") return handleSpecialistConfirm(bot, query);
  if (query.data === "resend_invites") return handleResendInvites(bot, query);
});

bot.on("message", (msg) => handleClientMessage(bot, msg));

// bot.on("channel_post", (msg) => {
//   console.log("CHANNEL ID:", msg.chat.id);
// }); // Нужен для уточнения ид канала

export default bot;
