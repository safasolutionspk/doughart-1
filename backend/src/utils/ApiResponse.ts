export type ApiSuccessPayload<T> = {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export function sendSuccess<T>(
  res: import("express").Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: Record<string, unknown>,
) {
  const payload: ApiSuccessPayload<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
  res.status(statusCode).json(payload);
}
