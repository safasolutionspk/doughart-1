/** Built-in protected catalog categories (stable identity). */
export const COMBO_OFFERS_CATEGORY = {
  name: "Combo Offers",
  slug: "combo-offers",
  /** Place after typical themed categories; still sortable among actives. */
  sortOrder: 50,
  description: "Special combo packages and offer sets.",
} as const;

export type SystemCategoryDefinition = typeof COMBO_OFFERS_CATEGORY;

export function isComboOffersSlug(slug: string | undefined | null): boolean {
  return (slug ?? "").trim().toLowerCase() === COMBO_OFFERS_CATEGORY.slug;
}

export function isComboOffersName(name: string | undefined | null): boolean {
  return (name ?? "").trim().toLowerCase() === COMBO_OFFERS_CATEGORY.name.toLowerCase();
}
