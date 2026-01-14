import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
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

bot.onText(/\/start/, (msg) => handleStart(bot, msg));

bot.on("callback_query", async (query) => {
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

bot.on("channel_post", (msg) => {
  console.log("CHANNEL ID:", msg.chat.id);
}); // Нужен для уточнения ид канала

export default bot;
