import {
  findRequestByMessageAndNotExpired,
} from "../../models/Request.js";
import {
  upsertSpecialistWithOrder,
} from "../../models/Specialist.js";
import {
  findReaction,
  createReaction,
} from "../../models/Reaction.js";
import { metricIncrement, metricTiming } from "../../lib/metrics.js";
export async function handleOrder(bot, reaction) {
  const start = Date.now();
  const request = await findRequestByMessageAndNotExpired(
    String(reaction?.message?.message_id)
  );
  if (!request) return;

  const specialist = await upsertSpecialistWithOrder(
    reaction.from.id,
    reaction.from.username,
    request.id,
    request.text
  );

  if (!specialist) return;
  const exists = await findReaction(request.id, reaction?.from?.username);

  if (exists) return;
  await createReaction(request.id, reaction?.from?.username);

  const ordersCount = Number(specialist?.orders_count || 0);
  const ratingValue = specialist?.rating ? Number(specialist.rating) : 0;
  const formattedRating = ratingValue ? ratingValue.toFixed(1) : "Пока нет отзывов";

  await bot.sendMessage(
    request?.telegram_id,
    `✅ На вашу заявку откликнулся специалист:

👤 @${reaction?.from?.username}
Количество принятых заказов: ${ordersCount}
Рейтинг: ${ordersCount ? formattedRating : "Пока нет отзывов"}

Свяжитесь с ним напрямую и подтвердите заказ.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Подтвердить выбор", callback_data: `perform_order` }],
        ],
      },
    }
  );
  metricIncrement("request.reaction");
  metricTiming("handler.handle_order", Date.now() - start);
}
