export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor(message = "Session expired. Please sign in again.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

let isRedirectingToLogin = false;

export async function clearSessionAndRedirect(reason = "session-expired"): Promise<void> {
  if (typeof window === "undefined" || isRedirectingToLogin) {
    return;
  }

  isRedirectingToLogin = true;

  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } catch {
    // continue redirect even if logout request fails
  }

  const from = window.location.pathname;
  const params = new URLSearchParams({ reason });
  if (from && from !== "/login") {
    params.set("from", from);
  }

  window.location.replace(`/login?${params.toString()}`);
}

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
  });

  if (response.status === 401 && typeof window !== "undefined") {
    await clearSessionAndRedirect("session-expired");
    throw new UnauthorizedError();
  }

  return response;
}

export async function parseAdminJson<T>(response: Response): Promise<T> {
  let body: { success?: boolean; message?: string; data?: T };

  try {
    body = (await response.json()) as { success?: boolean; message?: string; data?: T };
  } catch {
    throw new ApiRequestError("Invalid server response", response.status);
  }

  if (!response.ok || body.success === false) {
    const message = body.message ?? "Something went wrong. Please try again.";
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[admin client] ${response.url} → ${response.status}: ${message}`,
      );
    }
    throw new ApiRequestError(message, response.status);
  }

  return body.data as T;
}
