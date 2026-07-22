const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export { API_BASE_URL };

export type BackendAuthData = {
  token: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
};

export type BackendSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type BackendFailure = {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
};
