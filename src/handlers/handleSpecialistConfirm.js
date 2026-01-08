import User from "../models/User.js";
import { CATEGORIES } from "../lib/constants.js";

export async function handleSpecialistConfirm(bot, query) {
  const telegramId = query.from.id;
  const chatId = query.message.chat.id;

  const user = await User.findOne({ telegramId });

  if (!user || !user.categories?.length) {
    return bot.answerCallbackQuery(query.id, {
      text: "Выберите хотя бы одну категорию",
      show_alert: true,
    });
  }

  const selectedCategories = CATEGORIES.filter((c) =>
    user.categories.includes(c.key)
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

  user.pendingInvites = pendingInvites;
  user.lastInviteSentAt = new Date();
  user.state = "AWAITING_CHANNEL_JOIN";
  await user.save();

  await bot.answerCallbackQuery(query.id);
}
