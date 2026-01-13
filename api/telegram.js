import bot from "../src/bot/bot.js";
import "../src/lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  try {
    await bot.processUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Telegram webhook error:", e);
    res.status(500).json({ ok: false });
  }
}
