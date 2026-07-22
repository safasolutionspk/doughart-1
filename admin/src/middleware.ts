import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_PROFILE_COOKIE,
  AUTH_TOKEN_COOKIE,
  cookieBaseOptions,
} from "@/lib/auth/constants";
import { verifyAdminToken } from "@/lib/auth/token";

const PUBLIC_PATHS = ["/login"];
const AUTH_API_PATHS = ["/api/auth/login", "/api/auth/logout"];

function redirectToLogin(
  request: NextRequest,
  options?: { reason?: string; clearCookies?: boolean },
) {
  const loginUrl = new URL("/login", request.url);

  if (options?.reason) {
    loginUrl.searchParams.set("reason", options.reason);
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
  }

  const response = NextResponse.redirect(loginUrl);

  if (options?.clearCookies) {
    const expired = {
      ...cookieBaseOptions,
      maxAge: 0,
      expires: new Date(0),
    };
    response.cookies.set(AUTH_TOKEN_COOKIE, "", expired);
    response.cookies.set(AUTH_PROFILE_COOKIE, "", expired);
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;
  const hasInvalidToken = Boolean(token) && !session;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/dashboard" : "/login", request.url),
    );
  }

  if (AUTH_API_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return redirectToLogin(request, {
        reason: hasInvalidToken ? "session-expired" : "auth-required",
        clearCookies: hasInvalidToken,
      });
    }
    return NextResponse.next();
  }

  if (isPublic && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublic && !pathname.startsWith("/api/")) {
    if (!session) {
      return redirectToLogin(request, {
        reason: hasInvalidToken ? "session-expired" : "auth-required",
        clearCookies: hasInvalidToken,
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
