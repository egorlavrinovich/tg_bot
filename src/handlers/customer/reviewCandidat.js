import { setRequestMarkByMarkMessageId } from "../../models/Request.js";
import {
  setSpecialistOrderMarkByRequestId,
  recalcSpecialistRatingByRequestId,
} from "../../models/Specialist.js";
import { safeEditMessageReplyMarkup } from "../../bot/bot.js";
import { metricIncrement, metricTiming } from "../../lib/metrics.js";

export const reviewCandidat = async (bot, query) => {
  const start = Date.now();
  const telegramId = query.from.id;

  const category = query.data?.split("_");

  if (query.data.includes("candidat")) {
    await safeEditMessageReplyMarkup(
      bot,
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

    const request = await setRequestMarkByMarkMessageId(
      query?.message?.message_id,
      mark
    );

    if (request) {
      await setSpecialistOrderMarkByRequestId(request.id, mark);
      await recalcSpecialistRatingByRequestId(request.id);
    }
    await safeEditMessageReplyMarkup(
      bot,
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
    metricIncrement("review.submit");
  }
  metricTiming("handler.review", Date.now() - start);
};
