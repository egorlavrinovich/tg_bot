import bot from "../src/bot/bot.js";
import dbConnect from "../src/lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  // ⚠️ ОТВЕЧАЕМ СРАЗУ
  res.status(200).json({ ok: true });

  // ⬇️ всё ниже — НЕ блокирует Telegram
  try {
    await dbConnect();
    await bot.processUpdate(req.body);
  } catch (e) {
    console.error("Async webhook error:", e);
  }
}
