const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config({path:'./.env'});

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Пользователь';

  const welcomeMessage = `
👋 Привет, ${firstName}!

Я — ваш Telegram-бот. Я могу помочь вам с:
- Получением информации
- Выполнением команд
- Уведомлениями

Напишите /help, чтобы увидеть список доступных команд.
`;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
});

module.exports = bot;