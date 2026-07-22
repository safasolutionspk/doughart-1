export const CATEGORY_DESCRIPTION_MAX = 200;
export const CAKE_DESCRIPTION_MAX = 250;

export function clampDescription(value: string, max: number): string {
  return value.slice(0, max);
}

export function descriptionLengthError(
  value: string,
  max: number,
  label = "Description",
): string | null {
  if (value.length > max) {
    return `${label} must be ${max} characters or less`;
  }
  return null;
}
