import User from "../models/User.js";
import { CATEGORIES } from "../lib/constants.js";

export async function handleRole(bot, query) {
  const telegramId = query.from.id;
  const role = query.data === "role_client" ? "client" : "specialist";

  await User.findOneAndUpdate(
    { telegramId },
    { role, state: role === "client" ? "CATEGORY_SELECT" : "START" }
  );

  if (role === "client") {
    await bot.sendMessage(query.message.chat.id, "Выберите категорию услуги:", {
      reply_markup: {
        inline_keyboard: CATEGORIES.map(({ title, channelId }) => [
          {
            text: title,
            callback_data: `cat_${channelId}`,
          },
        ]),
      },
    });
  } else {
    await bot.sendMessage(
      query.message.chat.id,
      "Регистрация специалиста будет добавлена позже."
    );
  }
}
