export function normalizeCategoryIds(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const content =
      trimmed.startsWith("{") && trimmed.endsWith("}")
        ? trimmed.slice(1, -1)
        : trimmed;

    if (!content) return [];

    return content
      .split(",")
      .map((item) => item.trim().replace(/^"+|"+$/g, ""))
      .filter(Boolean)
      .map((item) => String(item));
  }

  return [];
}
