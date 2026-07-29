"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { CheckoutEmptyState } from "@/components/checkout/CheckoutEmptyState";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { Button } from "@/components/ui/Button";
import { OrderApiError, submitOrder } from "@/lib/api";
import { getCartSubtotal, hasPricedItems } from "@/lib/cart/cart";
import { checkoutCopy } from "@/lib/checkout";
import {
  clearCheckoutDraft,
  emptyCheckoutForm,
  loadCheckoutDraft,
  mergeFormWithDraft,
  saveCheckoutDraft,
  type CheckoutDraftForm,
} from "@/lib/checkout/draft";
import {
  buildOrderPayloadFromCart,
  buildOrderPayloadFromCake,
} from "@/lib/checkout/orderPayload";
import {
  getFirstCheckoutError,
  hasCheckoutErrors,
  mapApiFieldErrors,
  validateCheckoutForm,
  type CheckoutFieldErrors,
} from "@/lib/checkoutValidation";
import { cn } from "@/lib/cn";
import { formatPrice, type PublicCake } from "@/lib/catalog";
import { buildLoginRedirectUrl } from "@/lib/auth/returnUrl";
import { COD_PAYMENT_LABEL } from "@/lib/payment";

const inputClassName = cn(
  "w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-brown",
  "placeholder:text-brand-muted/60 outline-none transition-shadow",
  "focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
);

const inputErrorClassName = "border-red-300 focus-visible:ring-red-400";

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-brown";

type FormStatus = "idle" | "loading" | "error";

type CheckoutFormProps = {
  selectedCake?: PublicCake | null;
  selectedCakeSlug?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="mt-1.5 text-xs text-red-700" role="alert">
      {message}
    </p>
  );
}

const AUTH_REQUIRED_MESSAGE =
  "Please login or signup to place your order.";

export function CheckoutForm({
  selectedCake,
  selectedCakeSlug,
}: CheckoutFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer, hydrated: authHydrated, isAuthenticated } =
    useCustomerAuth();
  const { items: cartItems, hydrated: cartHydrated, clear: clearCart } =
    useCart();
  const draftRestored = useRef(false);

  const [form, setForm] = useState<CheckoutDraftForm>({ ...emptyCheckoutForm });
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasCartItems = cartHydrated && cartItems.length > 0;
  const checkoutFromCart = hasCartItems;
  const checkoutFromCakeQuery =
    !checkoutFromCart && Boolean(selectedCakeSlug || selectedCake);
  const canCheckout = checkoutFromCart || checkoutFromCakeQuery;
  const showEmptyState =
    cartHydrated && !canCheckout;

  const cartSubtotal = getCartSubtotal(cartItems);
  const showCartSubtotal = checkoutFromCart && hasPricedItems(cartItems);
  const singleCakeTotal =
    checkoutFromCakeQuery && selectedCake && selectedCake.price > 0
      ? selectedCake.price
      : 0;
  const orderTotal =
    showCartSubtotal ? cartSubtotal : singleCakeTotal > 0 ? singleCakeTotal : 0;
  const showPricing = orderTotal > 0;

  useEffect(() => {
    if (draftRestored.current) {
      return;
    }
    draftRestored.current = true;

    const draft = loadCheckoutDraft();
    if (draft) {
      const timer = window.setTimeout(() => {
        setForm((prev) => mergeFormWithDraft(prev, draft.form));
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!draftRestored.current) {
      return;
    }
    saveCheckoutDraft({ form });
  }, [form]);

  function updateField<K extends keyof CheckoutDraftForm>(
    key: K,
    value: CheckoutDraftForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key as keyof CheckoutFieldErrors]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key as keyof CheckoutFieldErrors];
      return next;
    });
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canCheckout) {
      return;
    }

    if (authHydrated && !isAuthenticated) {
      saveCheckoutDraft({ form });
      router.push(buildLoginRedirectUrl("/checkout"));
      return;
    }

    const validationErrors = validateCheckoutForm(form);
    if (hasCheckoutErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setErrorMessage(getFirstCheckoutError(validationErrors));
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setFieldErrors({});

    const payload = checkoutFromCart
      ? buildOrderPayloadFromCart(form, cartItems)
      : buildOrderPayloadFromCake(
          form,
          selectedCake?.name ?? "Custom cake",
          selectedCakeSlug,
        );

    try {
      const response = await submitOrder(payload);

      clearCart();
      clearCheckoutDraft();

      const phoneParam = encodeURIComponent(form.phone.trim());
      router.push(
        `/order-success/${encodeURIComponent(response.orderNumber)}?phone=${phoneParam}`,
      );
    } catch (error) {
      setStatus("error");
      if (error instanceof OrderApiError) {
        const apiErrors = mapApiFieldErrors(error.fieldErrors);
        if (hasCheckoutErrors(apiErrors)) {
          setFieldErrors(apiErrors);
        }
        setErrorMessage(
          getFirstCheckoutError(apiErrors) ??
            error.message ??
            "Failed to place order. Please check your details and try again.",
        );
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  }

  if (!cartHydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-2xl bg-brand-pink-lighter/60" />
        <div className="h-48 rounded-2xl bg-brand-pink-lighter/60" />
      </div>
    );
  }

  if (showEmptyState) {
    return <CheckoutEmptyState />;
  }

  const showAuthBanner =
    searchParams.get("authRequired") === "1" ||
    (authHydrated && !isAuthenticated && canCheckout);

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {showAuthBanner ? (
        <div
          className="rounded-xl border border-brand-primary/30 bg-brand-pink-lighter/60 px-4 py-3 text-sm text-brand-brown"
          role="status"
        >
          <p>{AUTH_REQUIRED_MESSAGE}</p>
          <p className="mt-2">
            <Link
              href={buildLoginRedirectUrl("/checkout")}
              className="font-semibold text-brand-primary hover:underline"
            >
              Sign in
            </Link>
            {" · "}
            <Link href="/signup?returnUrl=%2Fcheckout" className="font-semibold text-brand-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      ) : null}

      {customer && isAuthenticated ? (
        <p className="text-sm text-brand-muted">
          Placing order as{" "}
          <span className="font-medium text-brand-brown">{customer.name}</span>
        </p>
      ) : null}

      {checkoutFromCart ? (
        <CheckoutOrderSummary items={cartItems} />
      ) : null}

      {selectedCake && !checkoutFromCart ? (
        <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-brown">
            Your cake
          </h2>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="font-display text-lg font-semibold text-brand-brown sm:text-xl">
              {selectedCake.name}
            </p>
            <p className="font-display text-xl font-semibold text-brand-primary sm:text-2xl">
              {formatPrice(selectedCake.price)}
            </p>
          </div>
          {selectedCake.description ? (
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {selectedCake.description}
            </p>
          ) : null}
        </section>
      ) : null}

      {selectedCake && checkoutFromCart && selectedCakeSlug ? (
        <p className="rounded-xl border border-brand-border/60 bg-brand-pink-lighter/40 px-4 py-3 text-sm text-brand-muted">
          You also opened checkout for{" "}
          <span className="font-medium text-brand-brown">{selectedCake.name}</span>
          . Your cart summary above will be submitted.
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-brown">
          Customer information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="checkout-name" className={labelClassName}>
              Full name <span className="text-brand-primary">*</span>
            </label>
            <input
              id="checkout-name"
              type="text"
              autoComplete="name"
              value={form.name}
              disabled={status === "loading"}
              onChange={(event) => updateField("name", event.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              className={cn(inputClassName, fieldErrors.name && inputErrorClassName)}
            />
            <FieldError message={fieldErrors.name} />
          </div>
          <div>
            <label htmlFor="checkout-phone" className={labelClassName}>
              Phone <span className="text-brand-primary">*</span>
            </label>
            <input
              id="checkout-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              disabled={status === "loading"}
              onChange={(event) => updateField("phone", event.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
              className={cn(inputClassName, fieldErrors.phone && inputErrorClassName)}
            />
            <FieldError message={fieldErrors.phone} />
          </div>
          <div>
            <label htmlFor="checkout-email" className={labelClassName}>
              Email{" "}
              <span className="font-normal normal-case text-brand-muted">
                (optional)
              </span>
            </label>
            <input
              id="checkout-email"
              type="email"
              autoComplete="email"
              value={form.email}
              disabled={status === "loading"}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              placeholder="Optional — for order updates"
              className={cn(inputClassName, fieldErrors.email && inputErrorClassName)}
            />
            <FieldError message={fieldErrors.email} />
            <p className="mt-1 text-xs text-brand-muted">
              Phone is required. Leave email blank if you prefer WhatsApp or SMS
              contact only.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-brown">
          Delivery
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="checkout-date" className={labelClassName}>
              Delivery date
            </label>
            <input
              id="checkout-date"
              type="date"
              value={form.deliveryDate}
              disabled={status === "loading"}
              min={new Date().toISOString().split("T")[0]}
              onChange={(event) =>
                updateField("deliveryDate", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.deliveryDate)}
              className={cn(
                inputClassName,
                fieldErrors.deliveryDate && inputErrorClassName,
              )}
            />
            <FieldError message={fieldErrors.deliveryDate} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-address" className={labelClassName}>
              Delivery address <span className="text-brand-primary">*</span>
            </label>
            <textarea
              id="checkout-address"
              rows={3}
              required
              value={form.address}
              disabled={status === "loading"}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Street, city, postcode"
              aria-invalid={Boolean(fieldErrors.address)}
              className={cn(
                inputClassName,
                "resize-y",
                fieldErrors.address && inputErrorClassName,
              )}
            />
            <FieldError message={fieldErrors.address} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-brown">
          Cake details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="checkout-size" className={labelClassName}>
              Pounds <span className="text-brand-primary">*</span>
            </label>
            <input
              id="checkout-size"
              type="text"
              required
              maxLength={80}
              value={form.size}
              placeholder="e.g. 2 pounds"
              disabled={status === "loading"}
              onChange={(event) => updateField("size", event.target.value)}
              aria-invalid={Boolean(fieldErrors.size)}
              className={cn(inputClassName, fieldErrors.size && inputErrorClassName)}
            />
            <FieldError message={fieldErrors.size} />
          </div>
          <div>
            <label htmlFor="checkout-flavor" className={labelClassName}>
              Flavor <span className="text-brand-primary">*</span>
            </label>
            <input
              id="checkout-flavor"
              type="text"
              required
              maxLength={120}
              value={form.flavor}
              placeholder="e.g. Chocolate, Vanilla, Red Velvet"
              disabled={status === "loading"}
              onChange={(event) => updateField("flavor", event.target.value)}
              aria-invalid={Boolean(fieldErrors.flavor)}
              className={cn(inputClassName, fieldErrors.flavor && inputErrorClassName)}
            />
            <FieldError message={fieldErrors.flavor} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-message" className={labelClassName}>
              Message on cake
            </label>
            <input
              id="checkout-message"
              type="text"
              maxLength={200}
              value={form.message}
              disabled={status === "loading"}
              onChange={(event) => updateField("message", event.target.value)}
              aria-invalid={Boolean(fieldErrors.message)}
              className={cn(
                inputClassName,
                fieldErrors.message && inputErrorClassName,
              )}
            />
            <FieldError message={fieldErrors.message} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-notes" className={labelClassName}>
              Additional notes
            </label>
            <textarea
              id="checkout-notes"
              rows={4}
              maxLength={1000}
              value={form.notes}
              disabled={status === "loading"}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Allergies, design tweaks, delivery instructions…"
              aria-invalid={Boolean(fieldErrors.notes)}
              className={cn(
                inputClassName,
                "resize-y",
                fieldErrors.notes && inputErrorClassName,
              )}
            />
            <FieldError message={fieldErrors.notes} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-brown">
          Payment Method
        </h2>
        <div
          className="rounded-2xl border border-brand-border bg-brand-pink-lighter/50 p-4 sm:p-5"
          role="note"
          aria-label="Payment method"
        >
          <p className="font-semibold text-brand-brown">{COD_PAYMENT_LABEL}</p>
          <p className="mt-1 text-sm leading-relaxed text-brand-muted">
            Pay when your order is delivered.
          </p>
        </div>
      </section>

      {showPricing ? (
        <div className="space-y-2 rounded-xl border border-brand-border bg-brand-cream px-4 py-3.5 sm:px-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-brand-brown">Order total</span>
            <span className="font-display text-xl font-semibold text-brand-primary sm:text-2xl">
              {formatPrice(orderTotal)}
            </span>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={status === "loading"}
      >
        {status === "loading"
          ? checkoutCopy.submittingLabel
          : checkoutCopy.submitLabel}
      </Button>
    </form>
  );
}
