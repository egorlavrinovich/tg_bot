import bot from "../src/bot/bot.js";

async function readJsonBody(req) {
  // @vercel/node иногда уже кладёт распарсенный body
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  // Fallback: читаем stream вручную
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return null;

  const raw = Buffer.concat(
    chunks.map((c) => (Buffer.isBuffer(c) ? c : Buffer.from(c)))
  ).toString("utf8");

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  console.log("Incoming Telegram update");
  const update = await readJsonBody(req);

  // ⚠️ Telegram ждёт быстрый 200 OK, иначе будут ретраи
  res.status(200).json({ ok: true });

  // ⬇️ всё ниже — НЕ блокирует Telegram
  try {
    if (!update) {
      console.error("Webhook: empty/unparseable update body");
      return;
    }
    console.log("Update body:", JSON.stringify(update));
    await bot.processUpdate(update);
  } catch (e) {
    console.error("Async webhook error:", e);
  }
}
