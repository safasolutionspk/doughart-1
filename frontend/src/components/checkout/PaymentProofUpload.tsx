"use client";

import { useState } from "react";
import { OrderApiError, uploadPaymentProof } from "@/lib/api";
import { cn } from "@/lib/cn";

type PaymentProofUploadProps = {
  onUploaded: (imageUrl: string) => void;
  disabled?: boolean;
  label?: string;
};

export function PaymentProofUpload({
  onUploaded,
  disabled = false,
  label = "Upload transfer screenshot",
}: PaymentProofUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      const result = await uploadPaymentProof(file);
      setFileName(file.name);
      setStatus("done");
      onUploaded(result.url);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof OrderApiError
          ? err.message
          : "Upload failed. Please try a JPG or PNG under 5MB.",
      );
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-brand-border bg-brand-pink-lighter/40 p-4">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-brown">
        {label}
      </label>
      <p className="mb-3 text-xs text-brand-muted">
        Optional now — you can also upload later from My Order.
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled || status === "uploading"}
        onChange={handleChange}
        className={cn(
          "block w-full text-sm text-brand-brown file:mr-3 file:rounded-full",
          "file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white",
          "file:transition-colors hover:file:bg-brand-button-hover",
        )}
      />
      {status === "uploading" ? (
        <p className="mt-2 text-xs text-brand-muted">Uploading…</p>
      ) : null}
      {status === "done" && fileName ? (
        <p className="mt-2 text-xs font-medium text-emerald-700">
          Uploaded: {fileName}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
