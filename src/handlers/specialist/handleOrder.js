import { CATEGORIES } from "../../lib/constants.js";
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
export async function handleOrder(bot, reaction) {
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

  await bot.sendMessage(
    request?.telegramId,
    `✅ На вашу заявку откликнулся специалист:

👤 @${reaction?.from?.username}
Количество принятых заказов: ${specialist?.orders?.length}
Рейтинг: ${specialist?.orders?.length ? specialist?.rating : "Пока нет отзывов"}

Свяжитесь с ним напрямую и подтвердите заказ.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Подтвердить выбор", callback_data: `perform_order` }],
        ],
      },
    }
  );
}
