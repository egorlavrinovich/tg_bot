import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import Request from "../models/Request.js";
import { CATEGORIES } from "../lib/constants.js";
dotenv.config({ path: "./.env" });
import webhook from "../routes/webhook.js";
import { handleStart } from "../handlers/start.js";
import { handleRole } from "../handlers/role.js";
import { handleCategory } from "../handlers/category.js";
import { handleClientMessage } from "../handlers/clientMessage.js";
import { handleOrder } from "../handlers/handleOrder.js";
import { closeOrder } from "../handlers/closeOrder.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   const firstName = msg.from.first_name || "Пользователь";

//   const welcomeMessage = `
// 👋 Привет, ${firstName}!

// Я — ваш Telegram-бот. Я могу помочь вам с:
// - Получением информации
// - Выполнением команд
// - Уведомлениями

// Напишите /help, чтобы увидеть список доступных команд.
// `;

//   bot.sendMessage(chatId, welcomeMessage, { parse_mode: "HTML" });
// });

// bot.on("message", async (msg) => {
//   console.log(msg);
//   if (!msg.text || !msg.chat) return;

//   const category = msg.text;
//   if (!CATEGORIES[category]) return;

//   const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//   const sent = await bot.sendMessage(
//     CATEGORIES[category].channelId,
//     `Новая заявка:\n\n${msg.text}\n\n👍 — взять в работу (10 минут)`
//   );

//   await Request.create({
//     clientId: msg.from.id,
//     category,
//     text: msg.text,
//     channelMessageId: sent.message_id,
//     expiresAt,
//   });

//   await bot.sendMessage(
//     msg.chat.id,
//     "Заявка отправлена. Ожидайте специалистов."
//   );
// });

bot.onText(/\/start/, (msg) => handleStart(bot, msg));

bot.on("callback_query", (query) => {
  if (query.data.startsWith("role_")) return handleRole(bot, query);
  if (query.data.startsWith("cat_")) return handleCategory(bot, query);
  if (query.data.startsWith("take_order")) return handleOrder(bot, query);
  if (query.data.startsWith("close_order")) return closeOrder(bot, query);
});

bot.on("message", (msg) => handleClientMessage(bot, msg));

// bot.on("channel_post", (msg) => {
//   console.log("CHANNEL ID:", msg.chat.id);
// });

export default bot;
