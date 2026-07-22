import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth/constants";

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

type BackendJson<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: Record<string, string[] | undefined>;
};

export type BackendFetchResult<T> =
  | { ok: true; status: number; data: T; meta?: Record<string, unknown> }
  | { ok: false; status: number; message: string; errors?: Record<string, string[] | undefined> };

function logBackendError(path: string, status: number, message: string): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[admin proxy] ${path} → ${status}: ${message}`);
  }
}

export async function backendFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<BackendFetchResult<T>> {
  const token = await getAuthToken();

  if (!token) {
    return { ok: false, status: 401, message: "Not authenticated" };
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach the API. Check NEXT_PUBLIC_API_URL.";
    logBackendError(path, 503, message);
    return {
      ok: false,
      status: 503,
      message: "Unable to reach the API. Check NEXT_PUBLIC_API_URL.",
    };
  }

  let body: BackendJson<T>;
  const rawText = await response.text();

  try {
    body = rawText ? (JSON.parse(rawText) as BackendJson<T>) : { success: false };
  } catch {
    const message = `Invalid API response (${response.status})`;
    logBackendError(path, response.status, `${message}: ${rawText.slice(0, 200)}`);
    return { ok: false, status: response.status, message };
  }

  if (!response.ok || !body.success) {
    const message = body.message ?? "Request failed";
    logBackendError(path, response.status, message);
    return {
      ok: false,
      status: response.status,
      message,
      errors: body.errors,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: body.data as T,
    meta: body.meta,
  };
}
