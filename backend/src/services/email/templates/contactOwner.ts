import type { EmailContent } from "../types";
import {
  brandPlainTextFooter,
  htmlDetailsTable,
  htmlHeading,
  htmlParagraph,
  wrapEmailHtml,
} from "./shared";

export type ContactOwnerEmailContext = {
  submissionId: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
};

export function contactOwnerNotificationEmail(
  ctx: ContactOwnerEmailContext,
): EmailContent {
  const subjectLabel = ctx.subject?.trim() || "Website enquiry";
  const subject = `DoughArt Contact Us — ${subjectLabel}`.slice(0, 180);

  const detailRows = [
    { label: "Name", value: ctx.name },
    { label: "Phone", value: ctx.phone },
    ...(ctx.email?.trim() ? [{ label: "Visitor email", value: ctx.email.trim() }] : []),
    ...(ctx.subject?.trim()
      ? [{ label: "Subject", value: ctx.subject.trim() }]
      : []),
    { label: "Message", value: ctx.message },
    { label: "Reference", value: ctx.submissionId },
  ];

  const textLines = [
    "New DoughArt Contact Us message",
    "",
    ...detailRows.map((row) => `${row.label}: ${row.value}`),
    "",
    brandPlainTextFooter(),
  ];

  const bodyHtml =
    htmlHeading("New DoughArt Contact Us message") +
    htmlParagraph(
      "A visitor submitted the Contact Us form on the DoughArt website.",
    ) +
    htmlDetailsTable(detailRows);

  return {
    subject,
    text: textLines.join("\n"),
    html: wrapEmailHtml({
      title: subject,
      preheader: `Contact from ${ctx.name}`,
      bodyHtml,
    }),
  };
}
