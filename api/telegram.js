import bot from "../src/bot/bot.js";
import dbConnect from "../src/lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  try {
    await dbConnect();
    await bot.processUpdate(req.body);
  } catch (e) {
    console.error("Webhook error:", e);
  }

  // ⚠️ Telegram ВСЕГДА ждёт 200
  return res.status(200).json({ ok: true });
}
