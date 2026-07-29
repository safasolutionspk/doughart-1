import type { EmailContent, OrderEmailContext } from "../types";
import {
  brandPlainTextFooter,
  buildMyOrderUrl,
  formatOrderAmount,
  formatOrderStatus,
  htmlButton,
  htmlDetailsTable,
  htmlHeading,
  htmlParagraph,
  htmlProminentTotal,
  orderDetailsRows,
  orderItemDetailRows,
  wrapEmailHtml,
} from "./shared";

/** Warm customer email sent only on first transition to confirmed. */
export function customerOrderConfirmedEmail(ctx: OrderEmailContext): EmailContent {
  const myOrderUrl = buildMyOrderUrl();
  const subject = `Your DoughArt Order Is Confirmed — ${ctx.orderNumber}`;
  const statusLabel = formatOrderStatus(ctx.status || "confirmed") || "Confirmed";

  const textLines = [
    `Hi ${ctx.customerName},`,
    "",
    "Thank you for choosing DoughArt Bakers!",
    "",
    "Your order has been confirmed, and our team is getting ready to make your sweet moments even more special.",
    "",
    "Your complete order details are shown below. We will contact you if we need any additional information about your cake or delivery.",
    "",
    "We truly appreciate your trust in DoughArt Bakers and cannot wait to prepare something beautiful for you.",
    "",
    `Status: ${statusLabel}`,
    ...orderDetailsRows(ctx).map((row) => `${row.label}: ${row.value}`),
    "",
    "Ordered items:",
    ...orderItemDetailRows(ctx).map((row) => `- ${row.value}`),
    "",
    `Final total: ${formatOrderAmount(ctx)}`,
    "",
    myOrderUrl
      ? `Track your order: ${myOrderUrl}`
      : "Track your order on our website under My Order (order number + phone).",
    "",
    brandPlainTextFooter(),
  ];

  let bodyHtml =
    htmlHeading("Your DoughArt order is confirmed") +
    htmlParagraph(`Hi ${ctx.customerName},`) +
    htmlParagraph("Thank you for choosing DoughArt Bakers!") +
    htmlParagraph(
      "Your order has been confirmed, and our team is getting ready to make your sweet moments even more special.",
    ) +
    htmlParagraph(
      "Your complete order details are shown below. We will contact you if we need any additional information about your cake or delivery.",
    ) +
    htmlParagraph(
      "We truly appreciate your trust in DoughArt Bakers and cannot wait to prepare something beautiful for you.",
    ) +
    htmlDetailsTable(orderDetailsRows({ ...ctx, status: ctx.status || "confirmed" })) +
    htmlParagraph("Ordered items:") +
    htmlDetailsTable(orderItemDetailRows(ctx)) +
    htmlProminentTotal("Final total", formatOrderAmount(ctx));

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
      preheader: `Order ${ctx.orderNumber} is confirmed`,
      bodyHtml,
    }),
  };
}
