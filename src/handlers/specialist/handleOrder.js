import User from "../../models/User.js";
import { CATEGORIES } from "../../lib/constants.js";
import Request from "../../models/Request.js";
import Reaction from "../../models/Reaction.js";
import Specialist from "../../models/Specialist.js";
export async function handleOrder(bot, reaction) {
  const request = await Request.findOneAndUpdate(
    {
      messageId: reaction?.message?.message_id,
      status: "active",
      expiresAt: { $gt: new Date() },
    },
    {
      $setOnInsert: {
        specialistId: reaction?.from?.id,
        specialistName: reaction?.from?.username,
      },
    },
    { upsert: true }
  );
  if (!request) return;

  const specialist = await Specialist.findOneAndUpdate(
    { telegramId: reaction.from.id },
    {
      $setOnInsert: {
        telegramId: reaction.from.id,
        username: reaction.from.username,
      },
      $addToSet: {
        orders: {
          requestId: request?._id,
          reactedAt: new Date(),
          requestText: request?.text,
        },
      },
    },
    { upsert: true }
  );

  if (!specialist) return;
  const exists = await Reaction.findOne({
    requestId: request._id,
    specialistId: reaction?.from?.username,
  });

  if (exists) return;
  await Reaction.create({
    requestId: request._id,
    specialistId: reaction?.from?.username,
    reactedAt: new Date(),
  });

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
