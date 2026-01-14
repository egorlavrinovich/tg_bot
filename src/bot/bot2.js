import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;

// ❌ polling НЕ используем
const bot = new TelegramBot(token);

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Привет! Я Telegram-бот, работающий на Vercel 🚀"
  );
});

bot.on("message", (msg) => {
  if (msg.text && msg.text !== "/start") {
    bot.sendMessage(msg.chat.id, `Ты написал: ${msg.text}`);
  }
});

export default bot;
