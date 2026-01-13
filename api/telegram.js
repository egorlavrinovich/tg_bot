import bot from "../src/bot/bot.js";
import dbConnect from "../src/lib/db.js";

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
