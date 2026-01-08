import { CATEGORIES } from "../lib/constants.js";

export function buildSpecialistCategoriesKeyboard(selected = []) {
  return {
    inline_keyboard: [
      [
        ...CATEGORIES.map((cat) => ({
          text: selected.includes(cat.channelId)
            ? `✅ ${cat.title}`
            : cat.title,
          callback_data: `spec_cat_${cat.channelId}`,
        })),
      ],
      [
        {
          text: "✅ Подтвердить",
          callback_data: "spec_confirm",
        },
      ],
    ],
  };
}
