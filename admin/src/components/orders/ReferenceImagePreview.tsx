import { cn } from "@/lib/cn";
import { resolveImageSrc } from "@/lib/upload/path";

type ReferenceImagePreviewProps = {
  source?: string | null;
  label?: string;
  className?: string;
  sizeClassName?: string;
  /** Hide label and use compact missing-image text for card headers */
  compact?: boolean;
};

export function ReferenceImageThumbnail({
  source,
  className,
  sizeClassName = "h-14 w-14",
}: Pick<ReferenceImagePreviewProps, "source" | "className" | "sizeClassName">) {
  const src = source ? resolveImageSrc(source) : "";

  if (!src) {
    return (
      <p
        className={cn(
          "max-w-[5.5rem] text-[10px] leading-snug text-brand-muted",
          className,
        )}
      >
        No reference image uploaded
      </p>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-block shrink-0 overflow-hidden rounded-lg border border-brand-border",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Custom cake reference"
        className={cn(sizeClassName, "object-cover object-center")}
      />
    </a>
  );
}

export function ReferenceImagePreview({
  source,
  label = "Reference image",
  className,
  sizeClassName = "h-20 w-20",
  compact = false,
}: ReferenceImagePreviewProps) {
  const src = source ? resolveImageSrc(source) : "";

  if (compact) {
    return (
      <ReferenceImageThumbnail
        source={source}
        className={className}
        sizeClassName={sizeClassName}
      />
    );
  }

  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
        {label}
      </p>
      {src ? (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block overflow-hidden rounded-lg border border-brand-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Custom cake reference"
            className={cn(sizeClassName, "object-cover object-center")}
          />
        </a>
      ) : (
        <p className="mt-1 text-xs text-brand-muted">No reference image uploaded</p>
      )}
    </div>
  );
}
