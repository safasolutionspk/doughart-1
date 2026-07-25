export const CHECKOUT_DRAFT_STORAGE_KEY = "sweetbite_checkout_draft_v1";

export type CheckoutDraftForm = {
  name: string;
  phone: string;
  email: string;
  flavor: string;
  size: string;
  message: string;
  deliveryDate: string;
  address: string;
  notes: string;
};

/** Payment method is not stored — public checkout is Cash on Delivery only. */
export type CheckoutDraft = {
  form: Partial<CheckoutDraftForm>;
};

export const emptyCheckoutForm: CheckoutDraftForm = {
  name: "",
  phone: "",
  email: "",
  flavor: "",
  size: "",
  message: "",
  deliveryDate: "",
  address: "",
  notes: "",
};

export function loadCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CheckoutDraft;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      CHECKOUT_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
  } catch {
    // Private mode or quota
  }
}

export function clearCheckoutDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Restore draft values only into empty fields (do not overwrite user input). */
export function mergeFormWithDraft(
  current: CheckoutDraftForm,
  draft: Partial<CheckoutDraftForm> | undefined,
): CheckoutDraftForm {
  if (!draft) {
    return current;
  }

  const next = { ...current };
  (Object.keys(emptyCheckoutForm) as (keyof CheckoutDraftForm)[]).forEach(
    (key) => {
      const existing = next[key].trim();
      const fromDraft = draft[key]?.trim();
      if (!existing && fromDraft) {
        next[key] = fromDraft;
      }
    },
  );
  return next;
}
