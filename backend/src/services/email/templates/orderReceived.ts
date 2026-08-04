import type { EmailContent, OrderEmailContext } from "../types";
import {
  brandPlainTextFooter,
  buildMyOrderUrl,
  htmlButton,
  htmlHeading,
  htmlParagraph,
  wrapEmailHtml,
} from "./shared";

/** Simple customer acknowledgement sent immediately after order creation. */
export function customerOrderReceivedEmail(ctx: OrderEmailContext): EmailContent {
  const myOrderUrl = buildMyOrderUrl();
  const subject = `Order Received — ${ctx.orderNumber}`;

  const textLines = [
    `Hi ${ctx.customerName},`,
    "",
    "Thank you for choosing DoughArt Bakers!",
    "",
    `We have received your order ${ctx.orderNumber}.`,
    "",
    "Our team will process your order shortly. Preparation and delivery will follow soon.",
    "",
    myOrderUrl
      ? `Track your order: ${myOrderUrl}`
      : "You can track your order on our website under My Order (order number + phone).",
    "",
    brandPlainTextFooter(),
  ];

  let bodyHtml =
    htmlHeading("We received your order") +
    htmlParagraph(`Hi ${ctx.customerName},`) +
    htmlParagraph("Thank you for choosing DoughArt Bakers!") +
    htmlParagraph(`We have received your order ${ctx.orderNumber}.`) +
    htmlParagraph(
      "Our team will process your order shortly. Preparation and delivery will follow soon.",
    );

  if (myOrderUrl) {
    bodyHtml +=
      htmlParagraph(
        "Use your order number and phone number on our My Order page to check your order status.",
      ) + htmlButton(myOrderUrl, "View My Order");
  }

  return {
    subject,
    text: textLines.join("\n"),
    html: wrapEmailHtml({
      title: subject,
      preheader: `Order ${ctx.orderNumber} has been received`,
      bodyHtml,
    }),
  };
}
