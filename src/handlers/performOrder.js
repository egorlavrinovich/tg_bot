import Request from "../models/Request.js";

export async function performOrder(bot, query) {
  const telegramId = query.from.id;
  if (query?.message?.message_id) {
    const result = await Request.findOneAndUpdate(
      { clientId: query.from.id, status: "active" },
      { status: "done" }
    );

    if (result && result?.text && result?.category) {
      await bot.editMessageText(
        `✅ Заявка выполнена\n\n` + `${result?.text}\n\n`,
        {
          chat_id: result?.category,
          message_id: result?.messageId,
        }
      );

      await bot.editMessageText(`✅ Заявка закрыта\n\n`, {
        chat_id: telegramId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ Новая заявка", callback_data: "role_client" }],
            [{ text: "🏠 Главное меню", callback_data: "menu" }],
          ],
        },
      });
    }
  }
}
