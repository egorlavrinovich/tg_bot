import {
  findUserByTelegramId,
  updateUserCategories,
} from "../../models/User.js";
import { buildSpecialistCategoriesKeyboard } from "../../utils/buildSpecialistCategoriesKeyboard.js";
import {
  safeAnswerCallbackQuery,
  safeEditMessageReplyMarkup,
} from "../../bot/bot.js";
import { normalizeCategoryIds } from "../../lib/normalizeCategoryIds.js";

export async function handleSpecialistCategory(bot, query) {
  const telegramId = query.from.id;
  const categoryKey = query.data.replace("spec_cat_", "");

  const user = await findUserByTelegramId(telegramId);
  if (!user) return;

  const selected = new Set(normalizeCategoryIds(user.categories));

  if (selected.has(categoryKey)) {
    selected.delete(categoryKey);
  } else {
    selected.add(categoryKey);
  }

  const categories = [...selected];
  await updateUserCategories(telegramId, categories);

  await safeEditMessageReplyMarkup(
    bot,
    buildSpecialistCategoriesKeyboard(categories),
    {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
    }
  );

  await safeAnswerCallbackQuery(bot, query);
}
