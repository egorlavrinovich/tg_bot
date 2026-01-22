import {
  findUserByTelegramId,
  updateUserStateAndCategory,
} from "../../models/User.js";
import { createRequest } from "../../models/Request.js";
import { metricIncrement, metricTiming } from "../../lib/metrics.js";
import { logError } from "../../lib/logger.js";

export async function handleClientMessage(bot, msg) {
  const start = Date.now();
  const user = await findUserByTelegramId(msg.from.id);

  if (!user || user.state !== "WAIT_MESSAGE" || !user.selected_category) return;

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const sent = await bot.sendMessage(
    user.selected_category,
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
    await createRequest({
      clientId: msg.from.id,
      category: user.selected_category,
      text: msg.text,
      channelMessageId: sent.message_id,
      expiresAt,
      status: "active",
      messageId: String(sent.message_id),
      telegramId: msg.from.id,
      closeRequestId: message?.message_id ?? null,
      mark: null,
      markMessageId: null,
      specialistId: null,
    });
    await updateUserStateAndCategory(
      msg.from.id,
      "WAITING_CONFIRM",
      null
    );
    metricIncrement("request.create_success");
    metricIncrement("request.create");
  } catch (error) {
    logError("handleClientMessage error", error);
    metricIncrement("request.create_error");
  } finally {
    metricTiming("handler.client_message", Date.now() - start);
  }
}
