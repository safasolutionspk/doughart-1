import type { EmailContent, OrderEmailContext } from "../types";
import {
  buildMyOrderUrl,
  formatCurrency,
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

export function quoteReadyCustomerEmail(ctx: OrderEmailContext): EmailContent {
  const myOrderUrl = buildMyOrderUrl();
  const quoted =
    ctx.quotedAmount != null && ctx.quotedAmount > 0
      ? formatCurrency(ctx.quotedAmount)
      : "See your order for details";

  const subject = `Your cake quote is ready — ${ctx.orderNumber}`;

  const textLines = [
    `Hi ${ctx.customerName},`,
    "",
    `Your quote for order ${ctx.orderNumber} is ready.`,
    `Quoted amount: ${quoted}`,
    ctx.quoteNotes ? `Notes from our team: ${ctx.quoteNotes}` : "",
    `Payment method: ${formatPaymentMethod(ctx.paymentMethod)}`,
    `Payment status: ${formatPaymentStatus(ctx.paymentStatus)}`,
    "",
    ...orderSummaryLines(ctx).slice(0, 3),
    "",
    myOrderUrl
      ? `View your order: ${myOrderUrl}`
      : "Visit our website and use My Order with your order number and phone.",
    "",
    "DoughArt",
  ].filter(Boolean);

  let bodyHtml =
    htmlHeading("Your quote is ready") +
    htmlParagraph(`Hi ${ctx.customerName},`) +
    htmlParagraph(
      `We have prepared your price for order ${ctx.orderNumber}. Please review the details below.`,
    ) +
    htmlDetailsTable([
      ...orderDetailsRows(ctx),
      ...(ctx.quoteNotes
        ? [{ label: "Quote notes", value: ctx.quoteNotes }]
        : []),
    ]);

  if (ctx.paymentMethod === "bank_transfer") {
    bodyHtml += htmlParagraph(
      "If you chose bank transfer, you can upload your payment proof from the My Order page after paying.",
    );
  }

  if (myOrderUrl) {
    bodyHtml += htmlButton(myOrderUrl, "View My Order");
  }

  return {
    subject,
    text: textLines.join("\n"),
    html: wrapEmailHtml({
      title: subject,
      preheader: `Quote ready for order ${ctx.orderNumber}`,
      bodyHtml,
    }),
  };
}
