import { findUserByTelegramId } from "../models/User.js";
import { handleCategory } from "./customer/category.js";
import { CATEGORIES } from "../lib/constants.js";
import { safeEditMessageReplyMarkup, safeEditMessageText } from "../bot/bot.js";

export async function handleClientCategorySelect(bot, query) {
  const telegramId = query.from.id;
  const chatId = query.message.chat.id;

  const categoryId = query.data.replace("cat_", "");

  const user = await findUserByTelegramId(telegramId);
  if (!user) return;

  // Проверяем: если специалист в этой категории → нельзя создавать заявку
  if (user.role === "specialist" && user.categories.includes(categoryId)) {
    await bot.sendMessage(
      chatId,
      "❌ Вы не можете оставить заявку в категории, в которой вы являетесь специалистом."
    );
    return;
  }

  const category = CATEGORIES.find(
    (item) => item.channelId === +query.data.split("_")[1]
  )?.title;

  await safeEditMessageReplyMarkup(
    bot,
    {
      inline_keyboard: [[{ text: "🏠 Главное меню", callback_data: "menu" }]],
    },
    {
      chat_id: telegramId,
      message_id: query.message.message_id,
    }
  );

  await safeEditMessageText(
    bot,
    `Вы выбрали категорию: ${category}`,
    {
      chat_id: telegramId,
      message_id: query.message.message_id,
    }
  );

  handleCategory(bot, query);
}
