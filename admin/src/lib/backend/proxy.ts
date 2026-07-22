import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/cookies";
import type { BackendFetchResult } from "@/lib/backend/fetch";

export function respondWithBackendResult<T>(
  result: BackendFetchResult<T>,
  options?: {
    successStatus?: number;
    meta?: Record<string, unknown>;
  },
): NextResponse {
  if (!result.ok) {
    const response = NextResponse.json(
      { success: false, message: result.message },
      { status: result.status },
    );

    if (result.status === 401) {
      clearAuthCookies(response);
    }

    return response;
  }

  return NextResponse.json(
    {
      success: true,
      data: result.data,
      ...(options?.meta ? { meta: options.meta } : {}),
    },
    { status: options?.successStatus ?? 200 },
  );
}
