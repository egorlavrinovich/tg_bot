// import bot from "../src/bot/bot.js";
import dbConnect from "../src/lib/db.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

bot.onText(/\/start/, (msg) => handleStart(bot, msg));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  try {
    await dbConnect(); // ⬅️ ОБЯЗАТЕЛЬНО
    await bot.processUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Webhook error:", e);
    res.status(500).json({ ok: false });
  }
}
