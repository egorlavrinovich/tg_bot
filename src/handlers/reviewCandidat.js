import Request from "../models/Request.js";

export const reviewCandidat = async (bot, query) => {
  const telegramId = query.from.id;

  const category = query.data?.split("_");

  if (category.length === 1) {
    await bot.editMessageReplyMarkup(
      {
        inline_keyboard: [
          [
            {
              text: "1⭐",
              callback_data: `review_1`,
            },
            {
              text: "2⭐",
              callback_data: `review_2`,
            },
            {
              text: "3⭐",
              callback_data: `review_3`,
            },
            {
              text: "4⭐",
              callback_data: `review_4`,
            },
            {
              text: "5⭐",
              callback_data: `review_5`,
            },
          ],
        ],
      },
      {
        chat_id: telegramId,
        message_id: query?.message?.message_id,
      }
    );
  } else {
    const mark = category?.[1];
    await Request.findOneAndUpdate(
      { markMessageId: query?.message?.message_id },
      { mark }
    );
    await bot.editMessageReplyMarkup(
      {
        inline_keyboard: [
          [
            {
              text: `Спасибо за отзыв, ваша оценка ${mark}⭐`,
              callback_data: `null`,
            },
          ],
        ],
      },
      {
        chat_id: telegramId,
        message_id: query?.message?.message_id,
      }
    );
  }
};
