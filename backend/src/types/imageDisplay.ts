export type ImageDisplay = {
  /** Scale relative to the frame. 1 = fill frame (cover). Typical range 1–3. */
  zoom: number;
  /** Horizontal offset from center in percent (−50…50). */
  x: number;
  /** Vertical offset from center in percent (−50…50). */
  y: number;
};

export const DEFAULT_IMAGE_DISPLAY: ImageDisplay = {
  zoom: 1,
  x: 0,
  y: 0,
};

export function clampImageDisplay(value: ImageDisplay): ImageDisplay {
  return {
    zoom: Math.min(3, Math.max(1, Number(value.zoom) || 1)),
    x: Math.min(50, Math.max(-50, Number(value.x) || 0)),
    y: Math.min(50, Math.max(-50, Number(value.y) || 0)),
  };
}

/** Returns undefined for missing/invalid legacy docs (use default rendering). */
export function normalizeImageDisplay(raw: unknown): ImageDisplay | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const value = raw as Partial<ImageDisplay>;
  if (
    typeof value.zoom !== "number" &&
    typeof value.x !== "number" &&
    typeof value.y !== "number"
  ) {
    return undefined;
  }
  return clampImageDisplay({
    zoom: typeof value.zoom === "number" ? value.zoom : 1,
    x: typeof value.x === "number" ? value.x : 0,
    y: typeof value.y === "number" ? value.y : 0,
  });
}

export function isDefaultImageDisplay(
  display: ImageDisplay | undefined | null,
): boolean {
  if (!display) {
    return true;
  }
  return display.zoom === 1 && display.x === 0 && display.y === 0;
}
