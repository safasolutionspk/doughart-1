import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getAuthToken } from "@/lib/backend/fetch";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  const token = await getAuthToken();
  if (!token) {
    const response = NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const formData = await request.formData();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${API_BASE_URL}/api/uploads/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach the API." },
      { status: 503 },
    );
  }

  let body: {
    success?: boolean;
    message?: string;
    data?: { filename: string; path?: string; url: string; size: number };
  };

  try {
    body = await backendResponse.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid upload response from API" },
      { status: 502 },
    );
  }

  const response = NextResponse.json(body, { status: backendResponse.status });

  if (backendResponse.status === 401) {
    clearAuthCookies(response);
  }

  return response;
}
