import User from "../models/User.js";
import { buildSpecialistCategoriesKeyboard } from "../utils/buildSpecialistCategoriesKeyboard.js";

export async function handleSpecialistCategory(bot, query) {
  const telegramId = query.from.id;
  const categoryKey = query.data.replace("spec_cat_", "");

  const user = await User.findOne({ telegramId });
  if (!user) return;

  const selected = new Set(user.categories || []);

  if (selected.has(categoryKey)) {
    selected.delete(categoryKey);
  } else {
    selected.add(categoryKey);
  }

  user.categories = [...selected];
  await user.save();

  await bot.editMessageReplyMarkup(
    buildSpecialistCategoriesKeyboard(user.categories),
    {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
    }
  );

  await bot.answerCallbackQuery(query.id);
}
