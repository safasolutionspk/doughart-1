import type { ItemType } from "../constants/itemTypes";

export type { ItemType } from "../constants/itemTypes";

export {
  DEFAULT_ITEM_TYPES,
  ITEM_TYPES,
  ITEM_TYPE_LABELS,
  hasItemType,
  isItemType,
  normalizeItemTypes,
} from "../constants/itemTypes";

export type CakeDetailsInput = {
  pounds?: string;
  flavor?: string;
  messageOnCake?: string;
  notes?: string;
};

export type GiftDetailsInput = {
  notes?: string;
};

export type ProductDetailsInput = {
  notes?: string;
};

export type OrderItemTypeDetails = {
  itemTypes?: ItemType[];
  cakeDetails?: CakeDetailsInput;
  giftDetails?: GiftDetailsInput;
  productDetails?: ProductDetailsInput;
};
