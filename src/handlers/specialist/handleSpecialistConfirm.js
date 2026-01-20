import {
  findUserByTelegramId,
  updateUserPendingInvites,
} from "../../models/User.js";
import { CATEGORIES } from "../../lib/constants.js";
import { safeAnswerCallbackQuery } from "../../bot/bot.js";

export async function handleSpecialistConfirm(bot, query) {
  const telegramId = query.from.id;
  const chatId = query.message.chat.id;

  const user = await findUserByTelegramId(telegramId);

  if (!user || !user.categories?.length) {
    await safeAnswerCallbackQuery(bot, query, {
      text: "Выберите хотя бы одну категорию",
      show_alert: true,
    });
    return;
  }

  const selectedCategories = CATEGORIES.filter((c) =>
    user.categories.includes(c.channelId)
  );

  let text =
    "Вы зарегистрированы как специалист.\n\n" +
    "Ссылки на группы (вступите в течение 1 часа):\n";

  const pendingInvites = [];

  for (const category of selectedCategories) {
    try {
      const invite = await bot.createChatInviteLink(category.channelId, {
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 60 * 60,
        name: `spec_${telegramId}_${category.key}`,
      });

      text += `\n${category.title}: ${invite.invite_link}`;

      pendingInvites.push({
        categoryKey: category.key,
        channelId: category.channelId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    } catch (e) {
      text += `\n${category.title}: ❌ ошибка создания ссылки`;
    }
  }

  await bot.sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🔁 Получить ссылки повторно",
            callback_data: "resend_invites",
          },
          { text: "🏠 Главное меню", callback_data: "menu" },
        ],
      ],
    },
  });

  await updateUserPendingInvites(
    telegramId,
    pendingInvites,
    new Date(),
    "AWAITING_CHANNEL_JOIN"
  );

  await safeAnswerCallbackQuery(bot, query);
}
