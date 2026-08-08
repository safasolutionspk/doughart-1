"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  clampImageDisplay,
  DEFAULT_IMAGE_DISPLAY,
  getFramedImageStyle,
  type ImageDisplay,
} from "@/lib/imageDisplay";
import { resolveImageSrc } from "@/lib/upload/path";

type ImageSetModalProps = {
  open: boolean;
  imageUrl: string;
  value: ImageDisplay | undefined;
  /** CSS aspect-ratio value, e.g. "1 / 1" */
  aspectRatio: string;
  /** Frame shape for preview (circle for categories/avatars). */
  frameShape?: "square" | "circle";
  title?: string;
  onCancel: () => void;
  onConfirm: (display: ImageDisplay) => void;
};

export function ImageSetModal({
  open,
  imageUrl,
  value,
  aspectRatio,
  frameShape = "square",
  title = "Set Image",
  onCancel,
  onConfirm,
}: ImageSetModalProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [draft, setDraft] = useState<ImageDisplay>(
    value ?? DEFAULT_IMAGE_DISPLAY,
  );
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }
    setDraft(clampImageDisplay(value ?? DEFAULT_IMAGE_DISPLAY));
    setPreviewKey(Date.now());
  }, [open, value, imageUrl]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const src = resolveImageSrc(imageUrl, previewKey);

  function setZoom(next: number) {
    setDraft((prev) => clampImageDisplay({ ...prev, zoom: next }));
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    frame.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: draft.x,
      originY: draft.y,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !frame) {
      return;
    }
    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const dxPct = ((event.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((event.clientY - drag.startY) / rect.height) * 100;
    setDraft(
      clampImageDisplay({
        ...draft,
        x: drag.originX + dxPct,
        y: drag.originY + dyPct,
      }),
    );
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    dragRef.current = null;
    try {
      frameRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-set-modal-title"
      onClick={onCancel}
    >
      <div
        className={cn(
          "flex max-h-[100dvh] w-full max-w-lg flex-col overflow-y-auto",
          "rounded-t-2xl border border-brand-border bg-white shadow-xl sm:rounded-2xl",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-brand-border px-4 py-3 sm:px-5">
          <h2
            id="image-set-modal-title"
            className="font-semibold text-brand-brown"
          >
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-brand-muted">
            Drag to reposition. Use zoom to frame how this appears on the
            website.
          </p>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <div
            ref={frameRef}
            className={cn(
              "relative mx-auto w-full max-w-sm touch-none overflow-hidden bg-brand-pink-lighter",
              "cursor-grab active:cursor-grabbing",
              "ring-1 ring-brand-border/70",
              frameShape === "circle" ? "rounded-full" : "rounded-xl",
            )}
            style={{ aspectRatio }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Set image preview"
              draggable={false}
              style={getFramedImageStyle(draft)}
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              aria-label="Zoom out"
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                "border-2 border-brand-border bg-white text-lg font-semibold text-brand-brown",
                "hover:border-brand-primary hover:text-brand-primary",
              )}
              onClick={() => setZoom(draft.zoom - 0.1)}
            >
              −
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={draft.zoom}
              aria-label="Zoom"
              className="h-2 w-full accent-[var(--color-brand-primary,#e75480)]"
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <button
              type="button"
              aria-label="Zoom in"
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                "border-2 border-brand-border bg-white text-lg font-semibold text-brand-brown",
                "hover:border-brand-primary hover:text-brand-primary",
              )}
              onClick={() => setZoom(draft.zoom + 0.1)}
            >
              +
            </button>
          </div>
          <p className="mt-1.5 text-center text-xs text-brand-muted">
            Zoom {draft.zoom.toFixed(2)}×
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-brand-border px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center rounded-2xl border-2 border-brand-border",
              "bg-white px-4 text-sm font-semibold text-brand-brown hover:bg-brand-pink-lighter",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_IMAGE_DISPLAY)}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center rounded-2xl border-2 border-brand-border",
              "bg-white px-4 text-sm font-semibold text-brand-brown hover:bg-brand-pink-lighter",
            )}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onConfirm(clampImageDisplay(draft))}
            className={cn(
              "inline-flex h-11 flex-[1.4] items-center justify-center rounded-2xl",
              "bg-brand-primary px-4 text-sm font-semibold text-white hover:opacity-95",
            )}
          >
            Set Image
          </button>
        </div>
      </div>
    </div>
  );
}
