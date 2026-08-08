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

/** Strip leading zeros from a decimal price string while typing (0 → 999 → "999"). */
export function sanitizePriceInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (cleaned === "") {
    return "";
  }

  const firstDot = cleaned.indexOf(".");
  const intRaw = firstDot === -1 ? cleaned : cleaned.slice(0, firstDot);
  const decRaw = firstDot === -1 ? undefined : cleaned.slice(firstDot + 1).replace(/\./g, "");

  let intPart = intRaw.replace(/^0+(?=\d)/, "");
  if (intPart === "") {
    intPart = "0";
  }

  if (decRaw === undefined) {
    // Preserve a trailing dot while the user is typing decimals (e.g. "12.")
    return cleaned.endsWith(".") ? `${intPart}.` : intPart;
  }

  return `${intPart}.${decRaw}`;
}

export function parsePriceInput(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === ".") {
    return 0;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}
