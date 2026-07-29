import type { EmailMessage, IEmailNotifier } from "./types";

export const consoleEmailNotifier: IEmailNotifier = {
  async send(message: EmailMessage) {
    const divider = "=".repeat(72);
    console.info(divider);
    console.info("[email_preview]");
    console.info(`To: ${message.to}`);
    if (message.replyTo) {
      console.info(`Reply-To: ${message.replyTo}`);
    }
    console.info(`Subject: ${message.subject}`);
    console.info("Text:");
    console.info(message.text);
    console.info(`HTML length: ${message.html?.length ?? 0}`);
    console.info(divider);
  },
};
