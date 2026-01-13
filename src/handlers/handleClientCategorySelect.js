import User from "../models/User.js";
import { handleCategory } from "./customer/category.js";
import { CATEGORIES } from "../lib/constants.js";

export async function handleClientCategorySelect(bot, query) {
  const telegramId = query.from.id;
  const chatId = query.message.chat.id;

  const categoryId = query.data.replace("cat_", "");

  const user = await User.findOne({ telegramId });
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

  await bot.editMessageReplyMarkup(
    {
      inline_keyboard: [[{ text: "🏠 Главное меню", callback_data: "menu" }]],
    },
    {
      chat_id: telegramId,
      message_id: query.message.message_id,
    }
  );

  await bot.editMessageText(`Вы выбрали категорию: ${category}`, {
    chat_id: telegramId,
    message_id: query.message.message_id,
  });

  user.state = "CLIENT_CREATE_REQUEST";
  user.selectedCategory = categoryId;
  await user.save();

  handleCategory(bot, query);
}
