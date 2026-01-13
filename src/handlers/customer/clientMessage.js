import User from "../../models/User.js";
import Request from "../../models/Request.js";

export async function handleClientMessage(bot, msg) {
  const user = await User.findOne({ telegramId: msg.from.id });

  if (!user || user.state !== "WAIT_MESSAGE" || !user.selectedCategory) return;

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const sent = await bot.sendMessage(
    user.selectedCategory,
    `Новая заявка №${msg?.message_id}:\n\n${msg.text}\n\n`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "👍Взять в работу", callback_data: `take_order` }],
        ],
      },
    }
  );

  try {
    const message = await bot.sendMessage(
      msg.chat.id,
      "Заявка отправлена.\nОжидайте откликов специалистов.",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "❌Закрыть заявку", callback_data: `close_order` }],
          ],
        },
      }
    );
    await Request.create({
      clientId: msg.from.id,
      category: user.selectedCategory,
      text: msg.text,
      messageId: sent.message_id,
      expiresAt,
      telegramId: msg.from.id,
      closeRequestId: message?.message_id, //TODO посмотреть почему обрабатывает предыдущую заявку
      mark: null,
      markMessageId: null,
    });
    await User.findOneAndUpdate(
      { telegramId: msg.from.id },
      { state: "WAITING_CONFIRM", selectedCategory: null }
    );
  } catch (error) {}
}
