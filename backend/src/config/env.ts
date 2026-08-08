import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

const envFilePath = path.resolve(__dirname, "../../.env");

const dotenvResult = dotenv.config({
  path: envFilePath,
  override: false,
});

if (dotenvResult.error) {
  console.warn(`[env] Could not load ${envFilePath}:`, dotenvResult.error.message);
}

/** Merge SMTP_PASS into SMTP_PASSWORD for compatibility with hosting panels */
const envInput = {
  ...process.env,
  SMTP_PASSWORD:
    process.env.SMTP_PASSWORD?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    undefined,
};

function maskMongoHost(uri: string): string {
  try {
    if (uri.startsWith("mongodb+srv://")) {
      const rest = uri.slice("mongodb+srv://".length);
      const at = rest.indexOf("@");
      const hostPart = at >= 0 ? rest.slice(at + 1) : rest;
      const host = hostPart.split("/")[0]?.split("?")[0] ?? "(unknown)";
      return `mongodb+srv://***@${host}`;
    }

    const normalized = uri.replace(/^mongodb:\/\//, "http://");
    const url = new URL(normalized);
    const port = url.port ? `:${url.port}` : "";
    return `mongodb://***@${url.hostname}${port}`;
  } catch {
    return "mongodb://(invalid-uri)";
  }
}

function isValidOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalUrl = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val))
  .refine((val) => val === undefined || isValidOrigin(val), {
    message: "Must be a valid http(s) URL without trailing slash",
  });

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    ADMIN_EMAIL: z.string().email(),
    ADMIN_PASSWORD: z.string().min(8),
    ADMIN_NAME: z.string().default("Admin"),
    CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
    /** Public shop URL (HTTPS in production) — used in docs/emails */
    FRONTEND_URL: optionalUrl,
    /** Admin dashboard URL (HTTPS in production) */
    ADMIN_URL: optionalUrl,
    JSON_BODY_LIMIT: z.string().default("512kb"),
    URLENCODED_BODY_LIMIT: z.string().default("512kb"),
    UPLOAD_PROVIDER: z.enum(["local", "s3", "cloudinary"]).default("local"),
    AWS_S3_BUCKET: z.string().optional(),
    AWS_S3_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    CLOUDINARY_FOLDER: z.string().default("doughart"),
    EMAIL_ENABLED: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1"),
    EMAIL_PROVIDER: z.enum(["noop", "console", "smtp"]).default("console"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    SMTP_SECURE: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1"),
    ORDER_NOTIFICATION_EMAIL: z.string().email().optional(),
    CONTACT_NOTIFICATION_EMAIL: z.string().email().optional(),
    WHATSAPP_NUMBER: z.string().optional(),
    NOTIFY_ADMIN_EMAIL: z.string().email().optional(),
  })
  .superRefine((data, ctx) => {
    const origins = data.CORS_ORIGIN.split(",").map((origin) => origin.trim());

    if (origins.length === 0 || origins.some((origin) => !isValidOrigin(origin))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CORS_ORIGIN must be a comma-separated list of valid URLs",
        path: ["CORS_ORIGIN"],
      });
    }

    if (data.NODE_ENV === "production" && data.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "JWT_SECRET must be at least 32 characters in production",
        path: ["JWT_SECRET"],
      });
    }

    if (data.NODE_ENV === "production" && data.ADMIN_PASSWORD.length < 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ADMIN_PASSWORD must be at least 12 characters in production",
        path: ["ADMIN_PASSWORD"],
      });
    }

    if (data.NODE_ENV === "production" && data.CORS_ORIGIN.includes("localhost")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "CORS_ORIGIN should not include localhost in production — use FRONTEND_URL and ADMIN_URL origins",
        path: ["CORS_ORIGIN"],
      });
    }

    if (data.EMAIL_ENABLED && data.EMAIL_PROVIDER === "smtp") {
      if (!data.SMTP_HOST?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SMTP_HOST is required when EMAIL_ENABLED=true and EMAIL_PROVIDER=smtp",
          path: ["SMTP_HOST"],
        });
      }
      if (!data.SMTP_USER?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SMTP_USER is required when EMAIL_ENABLED=true and EMAIL_PROVIDER=smtp",
          path: ["SMTP_USER"],
        });
      }
      if (!data.SMTP_PASSWORD?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "SMTP_PASS/SMTP_PASSWORD is required when EMAIL_ENABLED=true and EMAIL_PROVIDER=smtp",
          path: ["SMTP_PASSWORD"],
        });
      }
      if (!data.SMTP_FROM?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SMTP_FROM is required when EMAIL_ENABLED=true and EMAIL_PROVIDER=smtp",
          path: ["SMTP_FROM"],
        });
      }
    }

    if (data.UPLOAD_PROVIDER === "cloudinary") {
      if (!data.CLOUDINARY_CLOUD_NAME?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "CLOUDINARY_CLOUD_NAME is required when UPLOAD_PROVIDER=cloudinary",
          path: ["CLOUDINARY_CLOUD_NAME"],
        });
      }
      if (!data.CLOUDINARY_API_KEY?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "CLOUDINARY_API_KEY is required when UPLOAD_PROVIDER=cloudinary",
          path: ["CLOUDINARY_API_KEY"],
        });
      }
      if (!data.CLOUDINARY_API_SECRET?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "CLOUDINARY_API_SECRET is required when UPLOAD_PROVIDER=cloudinary",
          path: ["CLOUDINARY_API_SECRET"],
        });
      }
    }
  });

const REQUIRED_ENV_KEYS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "CORS_ORIGIN",
] as const;

const parsed = envSchema.safeParse(envInput);

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  const missing = REQUIRED_ENV_KEYS.filter((key) => {
    const value = process.env[key];
    return value === undefined || String(value).trim() === "";
  });

  console.error("\n[env] Configuration error — cannot start the API.\n");
  console.error(`Expected file: ${envFilePath}`);
  console.error("Copy backend/.env.example to backend/.env and set all required values.\n");

  if (missing.length > 0) {
    console.error("Missing or empty required variables:");
    for (const key of missing) {
      console.error(`  - ${key}`);
    }
    console.error("");
  }

  const otherErrors = Object.entries(fieldErrors).filter(
    ([, messages]) => messages && messages.length > 0,
  );
  if (otherErrors.length > 0) {
    console.error("Validation errors:");
    for (const [key, messages] of otherErrors) {
      console.error(`  - ${key}: ${messages?.join(", ")}`);
    }
    console.error("");
  }

  process.exit(1);
}

const parsedEnv = parsed.data;

export const env = {
  ...parsedEnv,
};

if (env.NODE_ENV === "development") {
  console.log(`[env] Loaded ${envFilePath}`);
  console.log(`[env] MongoDB: ${maskMongoHost(env.MONGODB_URI)}`);
}

export const corsOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
