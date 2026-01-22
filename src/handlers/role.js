import {
  findUserByTelegramId,
  upsertUserRoleAndState,
} from "../models/User.js";
import { CATEGORIES } from "../lib/constants.js";
import { buildSpecialistCategoriesKeyboard } from "../utils/buildSpecialistCategoriesKeyboard.js";
import { normalizeCategoryIds } from "../lib/normalizeCategoryIds.js";
import { safeEditMessageReplyMarkup } from "../bot/bot.js";

export async function handleRole(bot, query) {
  const telegramId = query.from.id;
  const chatId = query.message.chat.id;
  const role = query.data === "role_client" ? "client" : "specialist";

  const user = await findUserByTelegramId(telegramId);

  if (user?.state === "WAITING_CONFIRM")
    return bot.sendMessage(
      query?.chat?.id || query?.message?.chat?.id,
      "У вас открыта заявка, чтобы продолжить нужно закрыть заявку"
    );

  if (role === "client") {
    const existingCategories = normalizeCategoryIds(user?.categories);
    await upsertUserRoleAndState(
      telegramId,
      user?.role ? user.role : "client",
      "CATEGORY_SELECT",
      existingCategories
    );

    await safeEditMessageReplyMarkup(
      bot,
      { inline_keyboard: [[{ text: "🏠 Главное меню", callback_data: "menu" }]] },
      { chat_id: chatId, message_id: query.message.message_id }
    );

    await bot.sendMessage(chatId, "Выберите категорию услуги:", {
      reply_markup: {
        inline_keyboard: [
          CATEGORIES.map(({ title, channelId }) => ({
            text: title,
            callback_data: `cat_${channelId}`,
          })),
          [{ text: "🏠 Главное меню", callback_data: "menu" }],
        ],
      },
    });

    return;
  }

  await upsertUserRoleAndState(
    telegramId,
    "specialist",
    "SPECIALIST_CATEGORY_SELECT",
    []
  );

  await safeEditMessageReplyMarkup(
    bot,
    { inline_keyboard: [[{ text: "🏠 Главное меню", callback_data: "menu" }]] },
    { chat_id: chatId, message_id: query.message.message_id }
  );

  const chosenCategories = await bot.sendMessage(
    chatId,
    "Выберите категории, в которых вы работаете.\nМожно выбрать несколько:",
    {
      reply_markup: buildSpecialistCategoriesKeyboard([]),
    }
  );
}
