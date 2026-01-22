import {
  findUserByTelegramId,
  updateUserPendingInvites,
} from "../../models/User.js";
import { CATEGORIES } from "../../lib/constants.js";
import { safeAnswerCallbackQuery } from "../../bot/bot.js";
import { logError } from "../../lib/logger.js";
import { normalizeCategoryIds } from "../../lib/normalizeCategoryIds.js";

export async function handleResendInvites(bot, query) {
  const telegramId = query.from.id;
  const chatId = query.message.chat.id;

  const user = await findUserByTelegramId(telegramId);
  if (!user || !user.categories?.length) return;

  const userCategoryIds = normalizeCategoryIds(user.categories);
  const selectedCategories = CATEGORIES.filter((c) =>
    userCategoryIds.includes(String(c.channelId))
  );

  let text = "Повторные ссылки на группы:\n";

  const pendingInvites = [];

  for (const category of selectedCategories) {
    try {
      const invite = await bot.createChatInviteLink(category.channelId, {
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 60 * 60,
        name: `resend_${telegramId}_${category.key}`,
      });

      text += `\n${category.title}: ${invite.invite_link}`;

      pendingInvites.push({
        categoryKey: category.key,
        channelId: category.channelId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    } catch (error) {
      logError("handleResendInvites: error creating invite link", error, {
        category,
      });
      text += `\n${category.title}: ❌ ошибка`;
    }
  }

  const now = new Date();
  await updateUserPendingInvites(
    telegramId,
    pendingInvites,
    now,
    user.state
  );

  await bot.sendMessage(chatId, text);
  await safeAnswerCallbackQuery(bot, query);
}
