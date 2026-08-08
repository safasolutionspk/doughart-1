export const ITEM_TYPES = ["cake", "gift", "other"] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export const DEFAULT_ITEM_TYPES: ItemType[] = ["cake"];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  cake: "Cake",
  gift: "Gift",
  other: "Other",
};

export function isItemType(value: unknown): value is ItemType {
  return typeof value === "string" && (ITEM_TYPES as readonly string[]).includes(value);
}

/** Normalize stored/API values; missing/empty → cake for legacy products. */
export function normalizeItemTypes(raw?: unknown): ItemType[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [...DEFAULT_ITEM_TYPES];
  }

  const unique: ItemType[] = [];
  for (const value of raw) {
    if (isItemType(value) && !unique.includes(value)) {
      unique.push(value);
    }
  }

  return unique.length > 0 ? unique : [...DEFAULT_ITEM_TYPES];
}

export function hasItemType(
  types: readonly ItemType[] | undefined,
  type: ItemType,
): boolean {
  return normalizeItemTypes(types).includes(type);
}
