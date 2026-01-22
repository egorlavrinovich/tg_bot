import { closeActiveRequest } from "../../models/Request.js";
import { setUserState } from "../../models/User.js";
import { safeEditMessageText } from "../../bot/bot.js";
import { metricIncrement, metricTiming } from "../../lib/metrics.js";

export async function closeOrder(bot, query) {
  const start = Date.now();
  const telegramId = query.from.id;

  if (query?.message?.message_id) {
    const result = await closeActiveRequest(query.from.id);

    if (result && result?.text && result?.category) {
      await safeEditMessageText(
        bot,
        `❌ Заявка закрыта\n\n` + `${result?.text}\n\n`,
        {
          chat_id: result?.category,
          message_id: result?.message_id,
        }
      );

      await setUserState(telegramId, "CLOSE_REQUEST");

      await safeEditMessageText(
        bot,
        `❌ Заявка закрыта\n\n`,
        {
          chat_id: telegramId,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [{ text: "➕ Новая заявка", callback_data: "role_client" }],
              [{ text: "🏠 Главное меню", callback_data: "menu" }],
            ],
          },
        }
      );
      metricIncrement("request.close_success");
      metricIncrement("request.close");
    } else {
      metricIncrement("request.close_not_found");
    }
    metricTiming("handler.close_order", Date.now() - start);
  }
}
