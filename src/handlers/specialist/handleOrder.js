import User from "../../models/User.js";
import { CATEGORIES } from "../../lib/constants.js";
import Request from "../../models/Request.js";
import Reaction from "../../models/Reaction.js";

export async function handleOrder(bot, reaction) {
  const request = await Request.findOne({
    messageId: reaction?.message?.message_id,
    status: "active",
    expiresAt: { $gt: new Date() },
  });
  if (!request) return;
  //   const specialist = await Specialist.findOne({
  //     telegramId: reaction.user.id,
  //     categories: request.category,
  //   });

  //   if (!specialist) return;
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
