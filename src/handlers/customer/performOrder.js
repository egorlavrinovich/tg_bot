import { completeActiveRequest } from "../../models/Request.js";
import { setUserState } from "../../models/User.js";
import {
  safeEditMessageText,
  safeEditMessageReplyMarkup,
} from "../../bot/bot.js";
import { metricIncrement, metricTiming } from "../../lib/metrics.js";

export async function performOrder(bot, query) {
  const start = Date.now();
  const telegramId = query.from.id;
  if (query?.message?.message_id) {
    try {
      const result = await completeActiveRequest(
        query.from.id,
        query.message.message_id
      );

      if (result && result?.text && result?.category) {
        await safeEditMessageText(
          bot,
          `✅ Заявка выполнена\n\n` + `${result?.text}\n\n`,
          {
            chat_id: result?.category,
            message_id: result?.message_id,
          }
        );

        await setUserState(telegramId, "PERFORM_REQUEST");

        await safeEditMessageReplyMarkup(
          bot,
          {
            inline_keyboard: [
              [
                {
                  text: "⭐ Оценить качество услуги",
                  callback_data: `review_candidat`,
                },
              ],
            ],
          },
          {
            chat_id: telegramId,
            message_id: query.message.message_id,
          }
        );

        await safeEditMessageReplyMarkup(
          bot,
          {
            inline_keyboard: [],
          },
          {
            chat_id: telegramId,
            message_id: result?.close_request_id,
          }
        ); // редактируем сообщение на закрытие запроса

        await bot.sendMessage(
          telegramId,
          "Заявка закрыта. Что хотите сделать дальше?",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "➕ Новая заявка", callback_data: "role_client" }],
                [{ text: "🏠 Главное меню", callback_data: "menu" }],
              ],
            },
          }
        );
        metricIncrement("request.complete");
      }
    } catch (error) {
      await bot.sendMessage(telegramId, "Произошла ошибка", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ Новая заявка", callback_data: "role_client" }],
            [{ text: "🏠 Главное меню", callback_data: "menu" }],
          ],
        },
      });
      metricIncrement("request.complete_error");
    } finally {
      metricTiming("handler.perform_order", Date.now() - start);
    }
  }
}
