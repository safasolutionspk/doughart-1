import type { EmailContent, OrderEmailContext } from "../types";
import {
  buildAdminOrderUrl,
  formatPaymentMethod,
  formatPaymentStatus,
  htmlButton,
  htmlDetailsTable,
  htmlHeading,
  htmlParagraph,
  orderDetailsRows,
  orderSummaryLines,
  wrapEmailHtml,
} from "./shared";

/** Admin alert when a customer uploads bank transfer proof. */
export function adminPaymentProofEmail(ctx: OrderEmailContext): EmailContent {
  const adminUrl = buildAdminOrderUrl(ctx);
  const subject = `[DoughArt] Payment proof uploaded — ${ctx.orderNumber}`;

  const textLines = [
    "A customer uploaded payment proof for a bank transfer order.",
    "",
    ...orderSummaryLines(ctx),
    `Customer email: ${ctx.customerEmail}`,
    "",
    adminUrl
      ? `Verify in admin: ${adminUrl}`
      : "Log in to the admin dashboard to verify the proof and update payment status.",
    "",
    "DoughArt Admin",
  ];

  let bodyHtml =
    htmlHeading("Payment proof uploaded") +
    htmlParagraph(
      `${ctx.customerName} uploaded bank transfer proof for order ${ctx.orderNumber}. Please verify the screenshot and mark payment as paid when confirmed.`,
    ) +
    htmlDetailsTable([
      ...orderDetailsRows(ctx),
      { label: "Customer email", value: ctx.customerEmail },
      { label: "Customer phone", value: ctx.customerPhone },
      {
        label: "Payment method",
        value: formatPaymentMethod(ctx.paymentMethod),
      },
      {
        label: "Payment status",
        value: formatPaymentStatus(ctx.paymentStatus),
      },
    ]) +
    htmlParagraph(
      "Open the order in the admin dashboard to view the proof image and update status.",
    );

  if (adminUrl) {
    bodyHtml += htmlButton(adminUrl, "Review order in admin");
  }

  return {
    subject,
    text: textLines.join("\n"),
    html: wrapEmailHtml({
      title: subject,
      preheader: `Payment proof for ${ctx.orderNumber}`,
      bodyHtml,
    }),
  };
}
