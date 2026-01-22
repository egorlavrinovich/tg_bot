import {
  findUserByTelegramId,
  upsertUserRoleAndState,
} from "../models/User.js";
import { CATEGORIES } from "../lib/constants.js";
import { buildSpecialistCategoriesKeyboard } from "../utils/buildSpecialistCategoriesKeyboard.js";
import { normalizeCategoryIds } from "../lib/normalizeCategoryIds.js";
import { safeEditMessageReplyMarkup } from "../bot/bot.js";
import { metricIncrement, metricTiming } from "../lib/metrics.js";

export async function handleRole(bot, query) {
  const start = Date.now();
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
    if (!user?.role) {
      metricIncrement("user.register.client");
    } else {
      metricIncrement("user.role_select.client");
    }

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

    metricTiming("handler.role_select", Date.now() - start, { role: "client" });
    return;
  }

  const existingCategories = normalizeCategoryIds(user?.categories);
  await upsertUserRoleAndState(
    telegramId,
    "specialist",
    "SPECIALIST_CATEGORY_SELECT",
    existingCategories
  );
  if (user?.role !== "specialist") {
    metricIncrement("user.register.specialist");
  } else {
    metricIncrement("user.role_select.specialist");
  }

  await safeEditMessageReplyMarkup(
    bot,
    { inline_keyboard: [[{ text: "🏠 Главное меню", callback_data: "menu" }]] },
    { chat_id: chatId, message_id: query.message.message_id }
  );

  if (user?.role === "specialist") {
    await bot.sendMessage(
      chatId,
      "Вы уже зарегистрированы как специалист. Можно добавить или убрать категории:",
      {
        reply_markup: buildSpecialistCategoriesKeyboard(existingCategories),
      }
    );
    metricTiming("handler.role_select", Date.now() - start, {
      role: "specialist",
      existing: "true",
    });
    return;
  }

  await bot.sendMessage(
    chatId,
    "Выберите категории, в которых вы работаете.\nМожно выбрать несколько:",
    {
      reply_markup: buildSpecialistCategoriesKeyboard(existingCategories),
    }
  );
  metricTiming("handler.role_select", Date.now() - start, { role: "specialist" });
}
