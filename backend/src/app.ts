import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsOrigins, env } from "./config/env";
import { UPLOAD_PUBLIC_PREFIX, ensureUploadDir } from "./config/upload";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { serveUploadImages } from "./middleware/serveUploads";
import { generalLimiter } from "./middleware/rateLimiter";
import { rejectUnknownApiContentType } from "./middleware/security";
import apiRoutes from "./routes";

ensureUploadDir();

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
      hsts:
        env.NODE_ENV === "production"
          ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
          : false,
    }),
  );

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(generalLimiter);
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
  app.use(
    express.urlencoded({
      extended: true,
      limit: env.URLENCODED_BODY_LIMIT,
    }),
  );

  if (env.NODE_ENV !== "test") {
    app.use(
      morgan((tokens, req, res) =>
        JSON.stringify({
          method: tokens.method(req, res),
          url: tokens.url(req, res),
          status: Number(tokens.status(req, res)),
          responseTimeMs: Number(tokens["response-time"](req, res)),
        }),
      ),
    );
  }

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "DoughArt API",
      version: "1.0.0",
    });
  });

  app.use(UPLOAD_PUBLIC_PREFIX, serveUploadImages);

  app.use("/api", rejectUnknownApiContentType, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
