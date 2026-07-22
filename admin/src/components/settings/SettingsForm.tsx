"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/upload/ImageUploadField";
import { cn } from "@/lib/cn";
import { fetchSettings, updateSettings } from "@/lib/settings/client";
import {
  emptySettingsForm,
  formToPayload,
  settingsToForm,
  type SettingsFormState,
} from "@/lib/settings/types";
import { inputClassName, labelClassName, textareaClassName } from "@/lib/form";

type LoadState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "ready" };

export function SettingsForm() {
  const [loadState, setLoadState] = useState<LoadState>({ type: "loading" });
  const [form, setForm] = useState<SettingsFormState>(emptySettingsForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState({ type: "loading" });
      try {
        const settings = await fetchSettings();
        if (cancelled) {
          return;
        }
        setForm(settingsToForm(settings));
        setLoadState({ type: "ready" });
      } catch (error) {
        if (!cancelled) {
          setLoadState({
            type: "error",
            message:
              error instanceof Error ? error.message : "Failed to load settings",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updated = await updateSettings(formToPayload(form));
      setForm(settingsToForm(updated));
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (loadState.type === "loading") {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-brand-pink-lighter" />
        <div className="h-96 animate-pulse rounded-2xl bg-brand-pink-lighter" />
      </div>
    );
  }

  if (loadState.type === "error") {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
        role="alert"
      >
        <p className="text-sm font-medium text-red-800">{loadState.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 text-sm font-semibold text-red-700 underline-offset-2 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-brown">
          Business settings
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Update storefront contact details, branding, and delivery information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="admin-card space-y-8"
      >
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
            General
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="businessName" className={labelClassName}>
                Business name <span className="text-red-500">*</span>
              </label>
              <input
                id="businessName"
                required
                value={form.businessName}
                disabled={isSaving}
                onChange={(event) => updateField("businessName", event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tagline" className={labelClassName}>
                Tagline
              </label>
              <input
                id="tagline"
                value={form.tagline}
                disabled={isSaving}
                onChange={(event) => updateField("tagline", event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
            Contact
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={labelClassName}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                required
                value={form.phone}
                disabled={isSaving}
                onChange={(event) => updateField("phone", event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClassName}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                disabled={isSaving}
                onChange={(event) => updateField("email", event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className={labelClassName}>
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                required
                rows={2}
                value={form.address}
                disabled={isSaving}
                onChange={(event) => updateField("address", event.target.value)}
                className={textareaClassName}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
            Branding
          </h2>
          <ImageUploadField
            id="settings-logo"
            label="Logo"
            value={form.logo}
            onChange={(logo) => updateField("logo", logo)}
            disabled={isSaving}
          />
          <ImageUploadField
            id="settings-hero"
            label="Hero image"
            value={form.heroImage}
            onChange={(heroImage) => updateField("heroImage", heroImage)}
            disabled={isSaving}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
            Social
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="facebook" className={labelClassName}>
                Facebook
              </label>
              <input
                id="facebook"
                type="url"
                value={form.facebook}
                disabled={isSaving}
                onChange={(event) => updateField("facebook", event.target.value)}
                placeholder="https://www.facebook.com/sweetbitelahore"
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="instagram" className={labelClassName}>
                Instagram
              </label>
              <input
                id="instagram"
                type="url"
                value={form.instagram}
                disabled={isSaving}
                onChange={(event) => updateField("instagram", event.target.value)}
                placeholder="https://www.instagram.com/sweetbitelahore/"
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tiktok" className={labelClassName}>
                TikTok
              </label>
              <input
                id="tiktok"
                type="url"
                value={form.tiktok}
                disabled={isSaving}
                onChange={(event) => updateField("tiktok", event.target.value)}
                placeholder="https://www.tiktok.com/@sweetbitelahore"
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="whatsapp" className={labelClassName}>
                WhatsApp
              </label>
              <input
                id="whatsapp"
                value={form.whatsapp}
                disabled={isSaving}
                onChange={(event) => updateField("whatsapp", event.target.value)}
                placeholder="03046736831 or 923046736831"
                className={inputClassName}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
            Bank transfer
          </h2>
          <p className="text-sm text-brand-muted">
            Shown to customers who choose bank transfer at checkout, on order
            confirmation, and on My Order.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bankName" className={labelClassName}>
                Bank name
              </label>
              <input
                id="bankName"
                value={form.bankName}
                disabled={isSaving}
                onChange={(event) => updateField("bankName", event.target.value)}
                placeholder="e.g. HBL, Meezan, JazzCash Bank"
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="bankAccountTitle" className={labelClassName}>
                Account title
              </label>
              <input
                id="bankAccountTitle"
                value={form.bankAccountTitle}
                disabled={isSaving}
                onChange={(event) =>
                  updateField("bankAccountTitle", event.target.value)
                }
                placeholder="Account holder name"
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bankAccountNumber" className={labelClassName}>
                Account number / IBAN
              </label>
              <input
                id="bankAccountNumber"
                value={form.bankAccountNumber}
                disabled={isSaving}
                onChange={(event) =>
                  updateField("bankAccountNumber", event.target.value)
                }
                placeholder="PK00XXXX… or local account number"
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bankPaymentInstructions" className={labelClassName}>
                Payment instructions
              </label>
              <textarea
                id="bankPaymentInstructions"
                rows={4}
                value={form.bankPaymentInstructions}
                disabled={isSaving}
                onChange={(event) =>
                  updateField("bankPaymentInstructions", event.target.value)
                }
                placeholder="Include order number as reference, upload proof on My Order…"
                className={textareaClassName}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
            Delivery
          </h2>
          <div>
            <label htmlFor="deliveryInfo" className={labelClassName}>
              Delivery information
            </label>
            <textarea
              id="deliveryInfo"
              rows={4}
              value={form.deliveryInfo}
              disabled={isSaving}
              onChange={(event) => updateField("deliveryInfo", event.target.value)}
              placeholder="Delivery areas, lead times, pickup options…"
              className={textareaClassName}
            />
          </div>
        </section>

        {saveError && (
          <p className="text-sm text-red-700" role="alert">
            {saveError}
          </p>
        )}

        {saveSuccess && (
          <p
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            Settings saved successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "inline-flex h-10 items-center rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white",
            "hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isSaving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
