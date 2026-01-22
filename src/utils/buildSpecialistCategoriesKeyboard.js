import { CATEGORIES } from "../lib/constants.js";

export function buildSpecialistCategoriesKeyboard(selected = []) {
  const selectedIds = selected.map((value) => String(value));
  return {
    inline_keyboard: [
      [
        ...CATEGORIES.map((cat) => ({
          text: selectedIds.includes(String(cat.channelId))
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
