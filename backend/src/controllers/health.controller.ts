import type { Request, Response } from "express";
import mongoose from "mongoose";
import { sendSuccess } from "../utils/ApiResponse";

export function getHealth(_req: Request, res: Response) {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  sendSuccess(
    res,
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
    "API is healthy",
  );
}
