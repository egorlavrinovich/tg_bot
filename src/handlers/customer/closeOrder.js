import { closeActiveRequest } from "../../models/Request.js";
import { setUserState } from "../../models/User.js";

export async function closeOrder(bot, query) {
  const telegramId = query.from.id;

  if (query?.message?.message_id) {
    const result = await closeActiveRequest(query.from.id);

    if (result && result?.text && result?.category) {
      await bot.editMessageText(
        `❌ Заявка закрыта\n\n` + `${result?.text}\n\n`,
        {
          chat_id: result?.category,
          message_id: result?.messageId,
        }
      );

      await setUserState(telegramId, "CLOSE_REQUEST");

      await bot.editMessageText(`❌ Заявка закрыта\n\n`, {
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
