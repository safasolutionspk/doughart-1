import { NextResponse } from "next/server";
import {
  AUTH_PROFILE_COOKIE,
  AUTH_TOKEN_COOKIE,
  cookieBaseOptions,
} from "./constants";

export function clearAuthCookies(response: NextResponse): void {
  const expired = {
    ...cookieBaseOptions,
    maxAge: 0,
    expires: new Date(0),
  };

  response.cookies.set(AUTH_TOKEN_COOKIE, "", expired);
  response.cookies.set(AUTH_PROFILE_COOKIE, "", expired);
}
