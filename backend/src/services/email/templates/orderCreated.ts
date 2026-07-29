import type { EmailContent, OrderEmailContext } from "../types";
import {
  buildAdminOrderUrl,
  buildMyOrderUrl,
  formatCurrency,
  htmlButton,
  htmlDetailsTable,
  htmlHeading,
  htmlParagraph,
  orderDetailsRows,
  orderSummaryLines,
  wrapEmailHtml,
} from "./shared";

export function orderCreatedCustomerEmail(ctx: OrderEmailContext): EmailContent {
  const myOrderUrl = buildMyOrderUrl();
  const subject = `DoughArt Order Confirmation — ${ctx.orderNumber}`;

  const intro = ctx.awaitingQuote
    ? "Thank you for your custom cake request. We have received your order and will send you a quote soon."
    : "Thank you for your order. We have received it and will contact you shortly to confirm details.";

  const textLines = [
    `Hi ${ctx.customerName},`,
    "",
    intro,
    "",
    ...orderSummaryLines(ctx),
    "",
    myOrderUrl
      ? `Track your order anytime: ${myOrderUrl}`
      : "You can track your order on our website under My Order (use your order number and phone).",
    "",
    "DoughArt Bakers",
  ];

  let bodyHtml =
    htmlHeading("Your order is confirmed") +
    htmlParagraph(`Hi ${ctx.customerName},`) +
    htmlParagraph(intro) +
    htmlDetailsTable(orderDetailsRows(ctx));

  if (myOrderUrl) {
    bodyHtml +=
      htmlParagraph(
        "Use your order number and phone number on our My Order page to check your order status.",
      ) + htmlButton(myOrderUrl, "View My Order");
  } else {
    bodyHtml += htmlParagraph(
      "Visit our website and open My Order — enter your order number and phone to check status.",
    );
  }

  return {
    subject,
    text: textLines.join("\n"),
    html: wrapEmailHtml({
      title: subject,
      preheader: `Order ${ctx.orderNumber} received`,
      bodyHtml,
    }),
  };
}

function formatItemLines(ctx: OrderEmailContext): string[] {
  if (!ctx.items.length) {
    return ["- No item details available"];
  }

  return ctx.items.map((item) => {
    const qty = Number.isFinite(item.quantity) ? item.quantity : 1;
    const lineTotal = (item.unitPrice ?? 0) * qty;
    const parts = [
      `- ${item.cakeName} x${qty}`,
      `Unit: ${formatCurrency(item.unitPrice ?? 0)}`,
      `Line total: ${formatCurrency(lineTotal)}`,
    ];

    if (item.notes?.trim()) {
      parts.push(`Notes: ${item.notes.trim()}`);
    }

    return parts.join(" | ");
  });
}

function formatAdminTotal(ctx: OrderEmailContext): string {
  if (ctx.quotedAmount != null && ctx.quotedAmount > 0) {
    return formatCurrency(ctx.quotedAmount);
  }
  if (ctx.totalAmount > 0) {
    return formatCurrency(ctx.totalAmount);
  }
  return "To be confirmed";
}

export function adminNewOrderEmail(ctx: OrderEmailContext): EmailContent {
  const isCustomCake = ctx.awaitingQuote;
  const adminUrl = buildAdminOrderUrl(ctx);
  const subject = isCustomCake
    ? `New DoughArt Custom Cake Request ${ctx.orderNumber}`
    : `New DoughArt Order ${ctx.orderNumber}`;

  const heading = isCustomCake
    ? "New Custom Cake Request Received"
    : "New DoughArt Order Received";
  const intro = isCustomCake
    ? "A new custom cake request has been received in the admin panel."
    : "A new order has been received in the admin panel.";

  const customNotes = [ctx.designNotes, ctx.specialInstructions]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" | ");
  const referenceImageLink = ctx.designNotes?.trim().startsWith("http")
    ? ctx.designNotes.trim()
    : undefined;

  const detailLines = isCustomCake
    ? [
        `Customer name: ${ctx.customerName}`,
        `Phone: ${ctx.customerPhone}`,
        ...(ctx.customerEmail ? [`Email: ${ctx.customerEmail}`] : []),
        ...(ctx.cakeSize ? [`Cake size/servings: ${ctx.cakeSize}`] : []),
        ...(ctx.flavour ? [`Flavor: ${ctx.flavour}`] : []),
        ...(customNotes ? [`Theme/design notes: ${customNotes}`] : []),
        ...(ctx.eventDate ? [`Delivery date/time: ${ctx.eventDate}`] : []),
        ...(ctx.deliveryAddress ? [`Delivery address: ${ctx.deliveryAddress}`] : []),
        `Budget/total: ${formatAdminTotal(ctx)}`,
        ...(referenceImageLink ? [`Reference image link: ${referenceImageLink}`] : []),
      ]
    : [
        `Order number: ${ctx.orderNumber}`,
        `Customer name: ${ctx.customerName}`,
        `Phone: ${ctx.customerPhone}`,
        ...(ctx.customerEmail ? [`Email: ${ctx.customerEmail}`] : []),
        ...(ctx.deliveryAddress ? [`Delivery address: ${ctx.deliveryAddress}`] : []),
        ...(ctx.eventDate ? [`Delivery date/time: ${ctx.eventDate}`] : []),
        `Payment method: ${ctx.paymentMethod}`,
        `Payment status: ${ctx.paymentStatus}`,
        `Total amount: ${formatAdminTotal(ctx)}`,
        "Items:",
        ...formatItemLines(ctx),
      ];

  const textLines = [heading, "", intro, "", ...detailLines, ""];

  if (adminUrl) {
    textLines.push(`Open Admin Panel: ${adminUrl}`);
  } else {
    textLines.push("Open Admin Panel: (ADMIN_URL not configured)");
  }

  textLines.push("", "DoughArt Bakers Admin");

  let bodyHtml =
    htmlHeading(heading) +
    htmlParagraph(intro) +
    (isCustomCake
      ? htmlDetailsTable([
          { label: "Order number", value: ctx.orderNumber },
          { label: "Customer name", value: ctx.customerName },
          { label: "Phone", value: ctx.customerPhone },
          ...(ctx.customerEmail
            ? [{ label: "Email", value: ctx.customerEmail }]
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
        ])
      : htmlDetailsTable([
          ...orderDetailsRows(ctx),
          { label: "Customer name", value: ctx.customerName },
          { label: "Phone", value: ctx.customerPhone },
          ...(ctx.customerEmail
            ? [{ label: "Email", value: ctx.customerEmail }]
            : []),
          ...(ctx.deliveryAddress
            ? [{ label: "Delivery address", value: ctx.deliveryAddress }]
            : []),
          ...(ctx.eventDate
            ? [{ label: "Delivery date/time", value: ctx.eventDate }]
            : []),
        ]));

  if (!isCustomCake) {
    bodyHtml += htmlParagraph("Items:");
    bodyHtml += htmlDetailsTable(
      ctx.items.length
        ? ctx.items.map((item) => {
            const qty = Number.isFinite(item.quantity) ? item.quantity : 1;
            const total = formatCurrency((item.unitPrice ?? 0) * qty);
            const itemValue = `${item.cakeName} x${qty} | ${formatCurrency(item.unitPrice ?? 0)} each | ${total}`;
            return {
              label: "Item",
              value: item.notes?.trim()
                ? `${itemValue} | Notes: ${item.notes.trim()}`
                : itemValue,
            };
          })
        : [{ label: "Item", value: "No item details available" }],
    );
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
