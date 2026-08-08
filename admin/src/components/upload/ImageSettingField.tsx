"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { labelClassName } from "@/lib/form";
import {
  DEFAULT_IMAGE_DISPLAY,
  getFramedImageStyle,
  normalizeImageDisplay,
  type ImageDisplay,
} from "@/lib/imageDisplay";
import { uploadImage } from "@/lib/upload/client";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_HINT,
  validateImageUploadFile,
} from "@/lib/upload/constants";
import {
  hasStoredImage,
  normalizeStoredImagePath,
  resolveImageSrc,
} from "@/lib/upload/path";
import { ImageSetModal } from "./ImageSetModal";

export type ImageSettingFieldProps = {
  id: string;
  label?: string;
  image: string;
  imageDisplay?: ImageDisplay | null;
  onImageChange: (image: string) => void;
  onImageDisplayChange: (display: ImageDisplay | undefined) => void;
  disabled?: boolean;
  hint?: string;
  /** Storefront frame aspect ratio CSS value. */
  aspectRatio?: string;
  frameShape?: "square" | "circle";
  showUrlField?: boolean;
  fieldClassName?: string;
};

const actionButtonClass = cn(
  "inline-flex h-11 flex-1 items-center justify-center rounded-2xl border-2 border-brand-border bg-white px-4",
  "text-sm font-semibold text-brand-brown sm:flex-none",
  "hover:border-brand-primary hover:bg-brand-pink-lighter hover:text-brand-primary",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

/**
 * Reusable Choose Image + Set Image field for admin create/edit forms.
 * Choose always stays available; Set opens a framed pan/zoom editor.
 */
export function ImageSettingField({
  id,
  label = "Image",
  image,
  imageDisplay,
  onImageChange,
  onImageDisplayChange,
  disabled,
  hint = IMAGE_UPLOAD_HINT,
  aspectRatio = "1 / 1",
  frameShape = "square",
  showUrlField = true,
  fieldClassName: urlInputClassName,
}: ImageSettingFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);

  const hasImage = hasStoredImage(image);
  const display = normalizeImageDisplay(imageDisplay) ?? undefined;
  const previewSrc = hasImage ? resolveImageSrc(image, previewKey) : null;

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
      onImageChange(result.path);
      // New source image — clear stale crop from previous file.
      onImageDisplayChange(undefined);
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

  function handleUrlChange(next: string) {
    const normalized = normalizeStoredImagePath(next) ?? "";
    const previous = image.trim();
    onImageChange(normalized);
    if (normalized !== previous) {
      onImageDisplayChange(undefined);
      setPreviewKey(Date.now());
    }
  }

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

      {previewSrc && (
        <div
          className={cn(
            "relative mb-3 mx-auto w-full max-w-[14rem] overflow-hidden",
            "border border-brand-border bg-brand-pink-lighter",
            frameShape === "circle" ? "rounded-full" : "rounded-xl",
          )}
          style={{ aspectRatio }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${previewSrc}|${display?.zoom ?? 1}|${display?.x ?? 0}|${display?.y ?? 0}`}
            src={previewSrc}
            alt="Selected preview"
            style={
              display
                ? getFramedImageStyle(display)
                : {
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }
            }
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
          className={actionButtonClass}
        >
          {isUploading ? "Uploading…" : "Choose Image"}
        </button>
        <button
          type="button"
          disabled={disabled || isUploading || !hasImage}
          onClick={() => setEditorOpen(true)}
          className={actionButtonClass}
        >
          Set Image
        </button>
        {hasImage && (
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => {
              onImageChange("");
              onImageDisplayChange(undefined);
            }}
            className="inline-flex h-11 items-center rounded-2xl px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Remove
          </button>
        )}
      </div>

      {hasImage && (
        <p className="mt-2 text-xs font-medium text-brand-primary">
          Image selected ✓
          {display ? " · framing set" : ""}
        </p>
      )}

      <p className="mt-1.5 text-xs text-brand-muted">{hint}</p>

      {showUrlField && (
        <div className="mt-3">
          <label htmlFor={`${id}-url`} className="sr-only">
            Image URL
          </label>
          <input
            id={`${id}-url`}
            type="text"
            value={image}
            disabled={disabled || isUploading}
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder="/uploads/images/… or https://…"
            className={urlFieldClass}
          />
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <ImageSetModal
        open={editorOpen}
        imageUrl={image}
        value={display ?? DEFAULT_IMAGE_DISPLAY}
        aspectRatio={aspectRatio}
        frameShape={frameShape}
        onCancel={() => setEditorOpen(false)}
        onConfirm={(next) => {
          onImageDisplayChange(next);
          setEditorOpen(false);
        }}
      />
    </div>
  );
}
