import Request from "../models/Request.js";

export async function closeOrder(bot, query) {
  if (query?.message?.message_id) {
    const result = await Request.findOneAndUpdate(
      { clientId: query.from.id, status: "active" },
      { status: "closed" }
    );

    if (
      result &&
      result?.status === "closed" &&
      result?.text &&
      result?.category &&
      result?.messageId
    ) {
      await bot.editMessageText(
        `${result?.text}\n\n` + `❌ Заявка закрыта\n\n`,
        {
          chat_id: result?.category,
          message_id: result?.messageId,
        }
      );
    }
  }
}
