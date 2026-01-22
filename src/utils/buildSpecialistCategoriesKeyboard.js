import { CATEGORIES } from "../lib/constants.js";
import { normalizeCategoryIds } from "../lib/normalizeCategoryIds.js";

export function buildSpecialistCategoriesKeyboard(selected = []) {
  const selectedIds = normalizeCategoryIds(selected);
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
