import User from "../../models/User.js";
import { CATEGORIES } from "../../lib/constants.js";

export async function handleCategory(bot, query) {
  const telegramId = query.from.id;
  const category = query.data?.split("_")[1];

  if (!CATEGORIES.find((item) => item.channelId === +category)) return;

  await User.findOneAndUpdate(
    { telegramId },
    { selectedCategory: category, state: "WAIT_MESSAGE" }
  );

  await bot.sendMessage(
    telegramId,
    "Опишите, пожалуйста, задачу.\n" +
      "Чем подробнее описание, тем больше релевантных откликов.",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Отмена", callback_data: "role_client" }]],
      },
    }
  );
}
