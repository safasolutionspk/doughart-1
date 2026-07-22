"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { hasStoredImage, resolveImageSrc } from "@/lib/upload/path";

type CatalogImageProps = {
  image?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  cacheKey?: number | string;
};

export function CatalogImage({
  image,
  alt,
  className,
  fill = false,
  cacheKey,
}: CatalogImageProps) {
  const src = hasStoredImage(image) ? resolveImageSrc(image, cacheKey) : "";
  const resetKey = `${src}|${fill ? "fill" : "nofill"}`;

  return (
    <CatalogImageInner
      key={resetKey}
      src={src}
      alt={alt}
      className={className}
      fill={fill}
    />
  );
}

function CatalogImageInner({
  src,
  alt,
  className,
  fill,
}: {
  src: string;
  alt: string;
  className?: string;
  fill: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={cn(
          "flex items-center justify-center bg-brand-pink-lighter text-xs font-medium text-brand-muted",
          fill && "absolute inset-0",
          className,
        )}
      >
        No image
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(fill ? "absolute inset-0 h-full w-full" : "h-full w-full", className)}
      onError={() => setFailed(true)}
    />
  );
}
