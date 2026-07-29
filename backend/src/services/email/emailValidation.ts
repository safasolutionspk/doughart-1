const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalize optional email: trim + lowercase. Empty becomes "". */
export function normalizeOptionalEmail(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}

/** True when non-empty and passes basic syntax checks. */
export function isValidEmailSyntax(email: string): boolean {
  const normalized = email.trim();
  if (!normalized || normalized.length > 160) {
    return false;
  }
  if (/[\r\n\0]/.test(normalized)) {
    return false;
  }
  return EMAIL_PATTERN.test(normalized);
}

/**
 * Classify customer/recipient email for send decisions.
 * - missing: empty after normalize
 * - invalid: non-empty but malformed
 * - valid: syntactically acceptable (may still be undeliverable)
 */
export function classifyEmailAddress(
  email: string | undefined | null,
): "missing" | "invalid" | "valid" {
  const normalized = normalizeOptionalEmail(email ?? "");
  if (!normalized) {
    return "missing";
  }
  return isValidEmailSyntax(normalized) ? "valid" : "invalid";
}

/** Strip CR/LF/NUL to prevent header injection in subjects and header fields. */
export function sanitizeEmailHeader(value: string, maxLength = 200): string {
  return value
    .replace(/[\r\n\0]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Mask recipient for safe dashboard display — never store full address in tracking. */
export function maskEmailAddress(email: string): string {
  const normalized = email.trim().toLowerCase();
  const at = normalized.indexOf("@");
  if (at <= 0 || at === normalized.length - 1) {
    return "***";
  }
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}
