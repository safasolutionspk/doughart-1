export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

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
