"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

type CatalogCardImageProps = {
  apiImage?: string;
  fallbackSrc: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Defaults to cover. Use contain for homepage popular cards on mobile. */
  objectFit?: "cover" | "contain";
};

function isRemoteApiUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function CatalogCardImage({
  apiImage,
  fallbackSrc,
  alt,
  sizes,
  className,
  priority,
  objectFit = "cover",
}: CatalogCardImageProps) {
  const trimmedApiImage = apiImage?.trim() ?? "";
  const resetKey = `${trimmedApiImage}|${fallbackSrc}|${objectFit}`;

  return (
    <CatalogCardImageInner
      key={resetKey}
      apiImage={trimmedApiImage || undefined}
      fallbackSrc={fallbackSrc}
      alt={alt}
      sizes={sizes}
      className={className}
      priority={priority}
      objectFit={objectFit}
    />
  );
}

function CatalogCardImageInner({
  apiImage,
  fallbackSrc,
  alt,
  sizes,
  className,
  priority,
  objectFit = "cover",
}: CatalogCardImageProps) {
  const trimmedApiImage = apiImage?.trim() ?? "";
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const currentSrc =
    primaryFailed || !trimmedApiImage ? fallbackSrc : trimmedApiImage;
  const useFallbackOnly = primaryFailed || !trimmedApiImage;

  const handleError = () => {
    if (!useFallbackOnly) {
      setPrimaryFailed(true);
    }
  };

  const displaySrc = currentSrc || fallbackSrc;
  const showRemote = isRemoteApiUrl(displaySrc) && !useFallbackOnly;
  const imageClassName = cn(
    objectFit === "contain"
      ? "object-contain object-center"
      : "object-cover object-center",
    className,
  );

  if (showRemote) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displaySrc}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full", imageClassName)}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={imageClassName}
      onError={handleError}
      unoptimized={displaySrc.startsWith(`${API_BASE_URL}/uploads/`)}
    />
  );
}
