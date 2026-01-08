import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { handleStart } from "../handlers/start.js";
import { handleRole } from "../handlers/role.js";
import { handleCategory } from "../handlers/category.js";
import { handleClientMessage } from "../handlers/clientMessage.js";
import { handleOrder } from "../handlers/handleOrder.js";
import { closeOrder } from "../handlers/closeOrder.js";
import { performOrder } from "../handlers/performOrder.js";
import { reviewCandidat } from "../handlers/reviewCandidat.js";
import { handleSpecialistCategory } from "../handlers/handleSpecialistCategory.js";
import { handleSpecialistConfirm } from "../handlers/handleSpecialistConfirm.js";
import { handleResendInvites } from "../handlers/handleResendInvites.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => handleStart(bot, msg));

bot.on("callback_query", (query) => {
  if (query.data.startsWith("role_")) return handleRole(bot, query);
  if (query.data.startsWith("cat_")) return handleCategory(bot, query);
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

export default bot;
