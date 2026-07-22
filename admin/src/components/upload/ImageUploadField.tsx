"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { labelClassName } from "@/lib/form";
import { uploadImage } from "@/lib/upload/client";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_HINT,
  validateImageUploadFile,
} from "@/lib/upload/constants";
import {
  normalizeStoredImagePath,
  resolveImageSrc,
} from "@/lib/upload/path";

type ImageUploadFieldProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
  /** Hide built-in preview when the parent shows a hero preview */
  hideInlinePreview?: boolean;
  fieldClassName?: string;
};

export function ImageUploadField({
  id,
  label = "Image",
  value,
  onChange,
  disabled,
  hint = IMAGE_UPLOAD_HINT,
  hideInlinePreview = false,
  fieldClassName: urlInputClassName,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateImageUploadFile(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadImage(file);
      onChange(result.path);
      setPreviewKey(Date.now());
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  const previewSrc = resolveImageSrc(value, previewKey);
  const urlFieldClass =
    urlInputClassName ??
    cn(
      "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-brown",
      "placeholder:text-brand-muted/70 outline-none focus-visible:border-indigo-500",
      "focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-60",
    );

  return (
    <div>
      <label htmlFor={`${id}-file`} className={labelClassName}>
        {label}
      </label>

      {!hideInlinePreview && previewSrc && (
        <div className="mb-3 overflow-hidden rounded-xl border border-brand-border bg-brand-pink-lighter">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={previewSrc}
            src={previewSrc}
            alt="Selected preview"
            className="h-40 w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_UPLOAD_ACCEPT}
          className="sr-only"
          disabled={disabled || isUploading}
          onChange={handleFileChange}
        />
        <button
          type="button"
          id={`${id}-file`}
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex h-11 flex-1 items-center justify-center rounded-2xl border-2 border-brand-border bg-white px-4 text-sm font-semibold text-brand-brown sm:flex-none",
            "hover:border-brand-primary hover:bg-brand-pink-lighter hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isUploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => onChange("")}
            className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Remove
          </button>
        )}
      </div>

      <p className="mt-1.5 text-xs text-brand-muted">{hint}</p>

      <div className="mt-3">
        <label htmlFor={`${id}-url`} className="sr-only">
          Image URL
        </label>
        <input
          id={`${id}-url`}
          type="text"
          value={value}
          disabled={disabled || isUploading}
          onChange={(event) =>
            onChange(normalizeStoredImagePath(event.target.value) ?? "")
          }
          placeholder="/uploads/images/… or https://…"
          className={urlFieldClass}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
