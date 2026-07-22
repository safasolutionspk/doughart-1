import type { EmailMessage, IEmailNotifier } from "./types";

export const noopEmailNotifier: IEmailNotifier = {
  async send(_message: EmailMessage) {
    // intentionally empty
  },
};
