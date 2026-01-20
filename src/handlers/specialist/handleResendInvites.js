import User from "../../models/User.js";
import { CATEGORIES } from "../../lib/constants.js";
import { safeAnswerCallbackQuery } from "../../bot/bot.js";

export async function handleResendInvites(bot, query) {
  const telegramId = query.from.id;
  const chatId = query.message.chat.id;

  const user = await User.findOne({ telegramId });
  if (!user || !user.categories?.length) return;

  const selectedCategories = CATEGORIES.filter((c) =>
    user.categories.includes(c.channelId)
  );

  let text = "Повторные ссылки на группы:\n";

  user.pendingInvites = [];

  for (const category of selectedCategories) {
    try {
      const invite = await bot.createChatInviteLink(category.channelId, {
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 60 * 60,
        name: `resend_${telegramId}_${category.key}`,
      });

      text += `\n${category.title}: ${invite.invite_link}`;

      user.pendingInvites.push({
        categoryKey: category.key,
        channelId: category.channelId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    } catch {
      text += `\n${category.title}: ❌ ошибка`;
    }
  }

  user.lastInviteSentAt = new Date();
  await user.save();

  await bot.sendMessage(chatId, text);
  await safeAnswerCallbackQuery(bot, query);
}
