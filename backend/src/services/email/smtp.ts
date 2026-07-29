import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { env } from "../../config/env";
import { safeErrorLog } from "../../utils/safeLog";
import type { EmailMessage, IEmailNotifier } from "./types";

let transporter: Mail | null = null;

function getTransporter(): Mail {
  if (transporter) {
    return transporter;
  }

  if (!env.SMTP_HOST?.trim()) {
    throw new Error("SMTP_HOST is required when EMAIL_PROVIDER=smtp");
  }

  const auth =
    env.SMTP_USER?.trim() && env.SMTP_PASSWORD?.trim()
      ? {
          user: env.SMTP_USER.trim(),
          pass: env.SMTP_PASSWORD.trim(),
        }
      : undefined;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST.trim(),
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth,
  });

  return transporter;
}

export const smtpEmailNotifier: IEmailNotifier = {
  async send(message: EmailMessage) {
    const from = env.SMTP_FROM?.trim();
    if (!from) {
      throw new Error("SMTP_FROM is required when EMAIL_PROVIDER=smtp");
    }

    try {
      await getTransporter().sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      });
    } catch (error) {
      safeErrorLog("[email:smtp] send failed", error, {
        to: message.to,
        subject: message.subject,
      });
      throw error;
    }
  },
};
