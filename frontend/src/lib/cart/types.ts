export const CART_STORAGE_KEY = "sweetbite_cart_v1";

export type CartItem = {
  id: string;
  cakeSlug: string;
  categorySlug?: string;
  name: string;
  image?: string;
  unitPrice?: number;
  quantity: number;
  notes?: string;
};

export type CartState = CartItem[];

export type AddToCartInput = {
  cakeSlug: string;
  categorySlug?: string;
  name: string;
  image?: string;
  unitPrice?: number;
  quantity?: number;
  notes?: string;
};
