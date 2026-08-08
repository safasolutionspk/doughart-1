import { getApiFetchUrl, getPublicApiUrl } from "@/lib/config/apiUrl";

/** Server-side backend origin (uses API_INTERNAL_URL in Docker when set). */
export const API_BASE_URL = getApiFetchUrl();

/** Public API origin for browser-facing asset URLs. */
export const PUBLIC_API_BASE_URL = getPublicApiUrl();

export type BackendLoginResponse = {
  success: true;
  message: string;
  data: {
    token: string;
    admin: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
};

export type BackendErrorResponse = {
  success: false;
  message: string;
};
