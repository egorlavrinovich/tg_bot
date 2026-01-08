import User from "../models/User.js";
import { handleCategory } from "./customer/category.js";

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

  user.state = "CLIENT_CREATE_REQUEST";
  user.selectedCategory = categoryId;
  await user.save();

  handleCategory(bot, query);
}
