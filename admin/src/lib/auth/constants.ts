export const AUTH_TOKEN_COOKIE = "sb_admin_token";
export const AUTH_PROFILE_COOKIE = "sb_admin_profile";

/**
 * Admin session cookie lifetime (seconds). Default 7 days.
 * Must match backend JWT_EXPIRES_IN (e.g. 7d) so the token is not rejected early.
 * middleware.ts guards /dashboard: invalid/expired token → /login?reason=session-expired.
 */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const cookieBaseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
