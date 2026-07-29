import type { EmailContent, OrderEmailContext } from "../types";
import {
  brandPlainTextFooter,
  buildAdminOrderUrl,
  formatCurrency,
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

function formatAdminTotal(ctx: OrderEmailContext): string {
  if (ctx.quotedAmount != null && ctx.quotedAmount > 0) {
    return formatCurrency(ctx.quotedAmount);
  }
  if (ctx.totalAmount > 0) {
    return formatCurrency(ctx.totalAmount);
  }
  return "To be confirmed";
}

/** Owner notification for a newly persisted order. */
export function adminNewOrderEmail(ctx: OrderEmailContext): EmailContent {
  const isCustomCake = ctx.awaitingQuote;
  const adminUrl = buildAdminOrderUrl(ctx);
  const subject = isCustomCake
    ? `New DoughArt Custom Cake Request ${ctx.orderNumber}`
    : `New DoughArt Order ${ctx.orderNumber}`;

  const heading = isCustomCake
    ? "New Custom Cake Request"
    : "New DoughArt Order";
  const intro = isCustomCake
    ? "A new custom cake request has been received."
    : "A new order has been received.";

  const customNotes = [ctx.designNotes, ctx.specialInstructions]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" | ");
  const referenceImageLink = ctx.designNotes?.trim().startsWith("http")
    ? ctx.designNotes.trim()
    : undefined;

  const detailRows = isCustomCake
    ? [
        { label: "Order number", value: ctx.orderNumber },
        ...(ctx.createdAt
          ? [{ label: "Created", value: ctx.createdAt }]
          : []),
        ...(ctx.status
          ? [{ label: "Status", value: formatOrderStatus(ctx.status) }]
          : []),
        { label: "Customer name", value: ctx.customerName },
        { label: "Phone", value: ctx.customerPhone },
        ...(ctx.customerEmail?.trim()
          ? [{ label: "Email", value: ctx.customerEmail.trim() }]
          : []),
        ...(ctx.cakeSize
          ? [{ label: "Cake size/servings", value: ctx.cakeSize }]
          : []),
        ...(ctx.flavour ? [{ label: "Flavor", value: ctx.flavour }] : []),
        ...(customNotes
          ? [{ label: "Theme/design notes", value: customNotes }]
          : []),
        ...(ctx.eventDate
          ? [{ label: "Delivery date/time", value: ctx.eventDate }]
          : []),
        ...(ctx.deliveryAddress
          ? [{ label: "Delivery address", value: ctx.deliveryAddress }]
          : []),
        { label: "Budget/total", value: formatAdminTotal(ctx) },
        ...(referenceImageLink
          ? [{ label: "Reference image link", value: referenceImageLink }]
          : []),
      ]
    : [
        ...orderDetailsRows(ctx),
        { label: "Final total", value: formatOrderAmount(ctx) },
      ];

  const textLines = [
    heading,
    "",
    intro,
    "",
    ...detailRows.map((row) => `${row.label}: ${row.value}`),
    "",
  ];

  if (!isCustomCake) {
    textLines.push("Items:");
    for (const row of orderItemDetailRows(ctx)) {
      textLines.push(`- ${row.value}`);
    }
    textLines.push("");
  }

  if (adminUrl) {
    textLines.push(`Open Admin Panel: ${adminUrl}`);
  } else {
    textLines.push("Open Admin Panel: (ADMIN_URL not configured)");
  }

  textLines.push("", brandPlainTextFooter());

  let bodyHtml =
    htmlHeading(heading) + htmlParagraph(intro) + htmlDetailsTable(detailRows);

  if (!isCustomCake) {
    bodyHtml +=
      htmlParagraph("Ordered items:") +
      htmlDetailsTable(orderItemDetailRows(ctx)) +
      htmlProminentTotal("Final total", formatOrderAmount(ctx));
  } else {
    bodyHtml += htmlProminentTotal("Budget/total", formatAdminTotal(ctx));
  }

  bodyHtml += htmlParagraph(
    "Open the admin dashboard to review the order and continue processing.",
  );

  if (adminUrl) {
    bodyHtml += htmlButton(adminUrl, "Open Admin Panel");
  }

  return {
    subject,
    text: textLines.join("\n"),
    html: wrapEmailHtml({
      title: subject,
      preheader: `${heading} - ${ctx.orderNumber}`,
      bodyHtml,
    }),
  };
}
