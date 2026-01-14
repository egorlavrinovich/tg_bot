import User from "../models/User.js";

export async function handleStart(bot, msg) {
  const telegramId = msg.from.id;
  // const user = await User.findOne({ telegramId });

  // if (user?.state === "WAITING_CONFIRM") {
  //   return bot.sendMessage(
  //     msg?.chat?.id || msg?.message?.chat?.id,
  //     "У вас открыта заявка, чтобы продолжить нужно закрыть заявку"
  //   );
  // }

  // await User.findOneAndUpdate(
  //   { telegramId },
  //   { telegramId, state: "ROLE_SELECT" },
  //   { upsert: true }
  // );

  await bot.sendMessage(
    msg?.chat?.id || msg?.message?.chat?.id,
    "Здравствуйте!\nУкажите, пожалуйста, кем вы являетесь:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔍 Ищу специалиста", callback_data: "role_client" }],
          [{ text: "🧑‍💼 Я специалист", callback_data: "role_specialist" }],
        ],
      },
    }
  );
}
