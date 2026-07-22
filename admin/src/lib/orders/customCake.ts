import type { Order } from "./types";
import { hasStoredImage, isUploadStoragePath } from "@/lib/upload/path";

export function dashOr(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function isAwaitingQuote(order: Order): boolean {
  return (
    order.totalAmount === 0 &&
    (order.quotedAmount == null || order.quotedAmount === 0)
  );
}

export function isCustomCakeOrder(order: Order): boolean {
  return order.totalAmount === 0;
}

export function canEditCustomCakePrice(order: Order): boolean {
  return (
    isCustomCakeOrder(order) &&
    order.status !== "completed" &&
    order.status !== "cancelled"
  );
}

export type ParsedCustomCakeNotes = {
  giftNote?: string;
  referenceLink?: string;
  referenceFile?: string;
  extraNotes?: string;
};

export function parseCustomCakeNotes(
  specialInstructions?: string,
): ParsedCustomCakeNotes {
  if (!specialInstructions?.trim()) {
    return {};
  }

  const lines = specialInstructions.split("\n").map((line) => line.trim());
  const giftNote: string[] = [];
  const extraNotes: string[] = [];
  let referenceLink: string | undefined;
  let referenceFile: string | undefined;

  for (const line of lines) {
    const giftMatch = line.match(/^\[Gift note[^\]]*\]:\s*(.+)$/i);
    if (giftMatch) {
      giftNote.push(giftMatch[1]);
      continue;
    }

    const linkMatch = line.match(/^\[Inspiration[^\]]*\]:\s*(.+)$/i);
    if (linkMatch) {
      referenceLink = linkMatch[1];
      continue;
    }

    const fileMatch = line.match(/^\[Reference image\]:/i);
    if (fileMatch) {
      referenceFile = line.replace(/^\[Reference image\]:\s*/i, "");
      continue;
    }

    if (line.startsWith("[Cake:")) {
      continue;
    }

    if (line) {
      extraNotes.push(line);
    }
  }

  return {
    giftNote: giftNote.length > 0 ? giftNote.join("\n") : undefined,
    referenceLink,
    referenceFile,
    extraNotes: extraNotes.length > 0 ? extraNotes.join("\n") : undefined,
  };
}

/** Resolve stored reference/design image path from order fields. */
export function resolveCustomCakeReferenceImage(
  order: Pick<Order, "designNotes" | "specialInstructions">,
): string {
  const design = order.designNotes?.trim();
  if (design) {
    if (
      design.startsWith("http://") ||
      design.startsWith("https://") ||
      design.startsWith("/uploads") ||
      design.includes("cloudinary") ||
      isUploadStoragePath(design) ||
      hasStoredImage(design)
    ) {
      return design;
    }
  }

  const parsed = parseCustomCakeNotes(order.specialInstructions);
  if (!parsed.referenceFile) {
    return "";
  }

  const value = parsed.referenceFile.trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/uploads")
  ) {
    return value;
  }

  const urlMatch = value.match(/(https?:\/\/[^\s"]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  const pathMatch = value.match(/(\/uploads\/images\/[^\s"]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }

  return "";
}
