import { cookies } from "next/headers";
import {
  AUTH_PROFILE_COOKIE,
  AUTH_TOKEN_COOKIE,
} from "./constants";
import { verifyAdminToken, type AdminTokenPayload } from "./token";

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AdminSession = AdminTokenPayload & {
  profile: AdminProfile;
};

function parseProfileCookie(value: string | undefined): AdminProfile | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as AdminProfile;
    if (
      typeof parsed.id === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.role === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyAdminToken(token);
  if (!payload) {
    return null;
  }

  const profile =
    parseProfileCookie(cookieStore.get(AUTH_PROFILE_COOKIE)?.value) ?? {
      id: payload.sub,
      name: payload.email.split("@")[0] ?? "Admin",
      email: payload.email,
      role: payload.role,
    };

  return { ...payload, profile };
}
