"use client";

import { useEffect, useState } from "react";
import {
  fetchPublicSettings,
  hasBankTransferDetails,
  type PublicSettings,
} from "@/lib/settings";
import { cn } from "@/lib/cn";
import { bankProofUploadEnabled } from "@/lib/featureFlags";

type BankTransferInstructionsProps = {
  settings?: PublicSettings | null;
  orderNumber?: string;
  className?: string;
};

export function BankTransferInstructions({
  settings: initialSettings,
  orderNumber,
  className,
}: BankTransferInstructionsProps) {
  const [fetchedSettings, setFetchedSettings] = useState<PublicSettings | null>(
    null,
  );

  useEffect(() => {
    if (initialSettings) {
      return;
    }

    let cancelled = false;
    fetchPublicSettings().then((data) => {
      if (!cancelled) {
        setFetchedSettings(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialSettings]);

  const settings = initialSettings ?? fetchedSettings;

  if (!hasBankTransferDetails(settings)) {
    return (
      <div
        className={cn(
          "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900",
          className,
        )}
        role="status"
      >
        Bank transfer is selected. Our team will email you payment details
        shortly, or contact us on WhatsApp if you need them now.
      </div>
    );
  }

  const instructions = settings?.bankPaymentInstructions?.trim();

  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-brand-pink-lighter/40 px-4 py-4 text-sm text-brand-brown",
        className,
      )}
      role="region"
      aria-label="Bank transfer instructions"
    >
      <p className="font-semibold text-brand-brown">Bank transfer details</p>
      <dl className="mt-3 space-y-2">
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt className="text-brand-muted">Bank</dt>
          <dd className="font-medium">{settings?.bankName}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt className="text-brand-muted">Account title</dt>
          <dd className="font-medium">{settings?.bankAccountTitle}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt className="text-brand-muted">Account / IBAN</dt>
          <dd className="font-mono text-sm font-semibold tracking-wide">
            {settings?.bankAccountNumber}
          </dd>
        </div>
      </dl>
      {orderNumber ? (
        <p className="mt-3 text-brand-muted">
          Use order number{" "}
          <span className="font-semibold text-brand-brown">{orderNumber}</span>{" "}
          as your payment reference.
        </p>
      ) : null}
      {instructions ? (
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-brand-muted">
          {instructions}
        </p>
      ) : null}
      {!bankProofUploadEnabled ? (
        <p className="mt-3 text-xs leading-relaxed text-brand-muted sm:text-sm">
          After you transfer, use your order number as the payment reference and
          message us on WhatsApp with your order details so we can confirm
          payment.
        </p>
      ) : null}
    </div>
  );
}
