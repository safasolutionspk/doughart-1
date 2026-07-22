import { NextResponse } from "next/server";
import {
  API_BASE_URL,
  type BackendErrorResponse,
  type BackendLoginResponse,
} from "@/lib/api";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_PROFILE_COOKIE,
  AUTH_TOKEN_COOKIE,
  cookieBaseOptions,
} from "@/lib/auth/constants";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required" },
      { status: 400 },
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach the API. Check NEXT_PUBLIC_API_URL.",
      },
      { status: 503 },
    );
  }

  const payload = (await backendResponse.json()) as
    | BackendLoginResponse
    | BackendErrorResponse;

  if (!backendResponse.ok || !payload.success) {
    const message =
      "message" in payload ? payload.message : "Login failed. Please try again.";
    return NextResponse.json({ success: false, message }, { status: 401 });
  }

  const { token, admin } = payload.data;
  const response = NextResponse.json({
    success: true,
    message: payload.message,
    admin,
  });

  response.cookies.set(AUTH_TOKEN_COOKIE, token, {
    ...cookieBaseOptions,
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  response.cookies.set(
    AUTH_PROFILE_COOKIE,
    JSON.stringify({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    }),
    {
      ...cookieBaseOptions,
      maxAge: AUTH_COOKIE_MAX_AGE,
    },
  );

  return response;
}
