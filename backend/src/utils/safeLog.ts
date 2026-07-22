const SENSITIVE_KEY_PATTERN =
  /password|secret|token|authorization|cookie|jwt|api[_-]?key/i;

const BEARER_PATTERN = /bearer\s+[a-z0-9._-]+/gi;

export function redactSensitiveValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return "[REDACTED]";
  }

  if (typeof value === "string") {
    return redactSensitiveString(value);
  }

  return value;
}

export function redactSensitiveString(value: string): string {
  return value.replace(BEARER_PATTERN, "Bearer [REDACTED]");
}

export function safeAuditLog(payload: Record<string, unknown>): void {
  const sanitized = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      redactSensitiveValue(key, value),
    ]),
  );

  console.info(JSON.stringify({ type: "audit", ...sanitized }));
}

export function safeErrorLog(
  message: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const errorMessage =
    error instanceof Error ? redactSensitiveString(error.message) : "Unknown error";

  const logPayload: Record<string, unknown> = {
    type: "error",
    message,
    error: errorMessage,
    ...(context
      ? Object.fromEntries(
          Object.entries(context).map(([key, value]) => [
            key,
            redactSensitiveValue(key, value),
          ]),
        )
      : {}),
  };

  console.error(JSON.stringify(logPayload));
}
