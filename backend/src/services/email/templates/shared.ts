import { env } from "../../../config/env";
import type { OrderEmailContext } from "../types";

const BRAND_NAME = "DoughArt Bakers";
const BRAND_TAGLINE =
  "Crafting beautiful custom cakes for life’s sweetest moments.";
const BRAND_EMAIL = "doughartbakers@gmail.com";
const BRAND_PHONE = "0327 7707333";
const BRAND_ADDRESS = "Thokkar Niaz Baig, Lahore, Punjab, Pakistan";
const BRAND_WHATSAPP_URL = "https://wa.me/923277707333";
const COLOR_PRIMARY = "#b83d6a";
const COLOR_BROWN = "#3d2c29";
const COLOR_MUTED = "#6b5c58";
const COLOR_BG = "#fdf8f6";
const COLOR_CARD = "#ffffff";
const COLOR_BORDER = "#ead9d4";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  online_payment: "Online Payment",
  online_payment_full: "Full Online Payment",
  online_payment_advance: "50% Advance Payment",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  baking: "Baking",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function formatPaymentMethod(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method.replace(/_/g, " ");
}

export function formatPaymentStatus(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function formatOrderStatus(status?: string): string {
  if (!status) {
    return "";
  }
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function formatCurrency(amount: number): string {
  const formatted = amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `Rs ${formatted}`;
}

export function formatOrderAmount(ctx: OrderEmailContext): string {
  if (ctx.awaitingQuote) {
    return "Quote pending — we will email you when your price is ready.";
  }
  if (ctx.quotedAmount != null && ctx.quotedAmount > 0) {
    return formatCurrency(ctx.quotedAmount);
  }
  if (ctx.totalAmount > 0) {
    return formatCurrency(ctx.totalAmount);
  }
  return "To be confirmed";
}

export function resolveFinalTotal(ctx: OrderEmailContext): number | null {
  if (ctx.quotedAmount != null && ctx.quotedAmount > 0) {
    return ctx.quotedAmount;
  }
  if (ctx.totalAmount > 0) {
    return ctx.totalAmount;
  }
  return null;
}

export function buildMyOrderUrl(): string | undefined {
  const base = env.FRONTEND_URL?.replace(/\/$/, "");
  if (!base) {
    return undefined;
  }
  return `${base}/my-order`;
}

export function buildAdminOrderUrl(ctx: OrderEmailContext): string | undefined {
  const base = env.ADMIN_URL?.replace(/\/$/, "");
  if (!base || !ctx.orderId) {
    return undefined;
  }
  return `${base}/dashboard/orders/${ctx.orderId}`;
}

export function orderSummaryLines(ctx: OrderEmailContext): string[] {
  const lines = [
    `Order number: ${ctx.orderNumber}`,
    `Customer: ${ctx.customerName}`,
    `Cake: ${ctx.cakeType}`,
    `Amount: ${formatOrderAmount(ctx)}`,
    `Payment method: ${formatPaymentMethod(ctx.paymentMethod)}`,
    `Payment status: ${formatPaymentStatus(ctx.paymentStatus)}`,
  ];

  if (ctx.status) {
    lines.push(`Status: ${formatOrderStatus(ctx.status)}`);
  }

  if (ctx.eventDate) {
    lines.push(`Delivery / event date: ${ctx.eventDate}`);
  }

  if (ctx.customerPhone) {
    lines.push(`Phone: ${ctx.customerPhone}`);
  }

  if (ctx.customerEmail?.trim()) {
    lines.push(`Email: ${ctx.customerEmail.trim()}`);
  }

  return lines;
}

export function wrapEmailHtml(options: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}): string {
  const preheader = options.preheader ?? options.title;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR_BG};font-family:Georgia,'Times New Roman',serif;color:${COLOR_BROWN};">
  <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR_BG};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR_CARD};border:1px solid ${COLOR_BORDER};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#fdf2f6 0%,#fce8ef 100%);padding:28px 32px;text-align:center;border-bottom:1px solid ${COLOR_BORDER};">
              <p style="margin:0;font-size:26px;font-weight:bold;color:${COLOR_PRIMARY};letter-spacing:0.02em;">${BRAND_NAME}</p>
              <p style="margin:8px 0 0;font-size:13px;color:${COLOR_MUTED};">${escapeHtml(BRAND_TAGLINE)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;font-size:15px;line-height:1.6;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background:${COLOR_BG};border-top:1px solid ${COLOR_BORDER};font-size:12px;color:${COLOR_MUTED};text-align:center;line-height:1.5;">
              <p style="margin:0;font-weight:bold;color:${COLOR_BROWN};">${BRAND_NAME}</p>
              <p style="margin:8px 0 0;">${escapeHtml(BRAND_TAGLINE)}</p>
              <p style="margin:8px 0 0;">${escapeHtml(BRAND_PHONE)}</p>
              <p style="margin:4px 0 0;">${escapeHtml(BRAND_EMAIL)}</p>
              <p style="margin:4px 0 0;">${escapeHtml(BRAND_ADDRESS)}</p>
              <p style="margin:12px 0 0;">WhatsApp: <a href="${escapeHtml(BRAND_WHATSAPP_URL)}" style="color:${COLOR_PRIMARY};text-decoration:none;">${escapeHtml(BRAND_WHATSAPP_URL)}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function brandPlainTextFooter(): string {
  return [
    BRAND_NAME,
    BRAND_TAGLINE,
    BRAND_PHONE,
    BRAND_EMAIL,
    BRAND_ADDRESS,
    `WhatsApp: ${BRAND_WHATSAPP_URL}`,
  ].join("\n");
}

export function htmlParagraph(text: string): string {
  return `<p style="margin:0 0 16px;color:${COLOR_BROWN};">${escapeHtml(text)}</p>`;
}

export function htmlHeading(text: string): string {
  return `<h1 style="margin:0 0 20px;font-size:20px;font-weight:bold;color:${COLOR_BROWN};">${escapeHtml(text)}</h1>`;
}

export function htmlButton(href: string, label: string): string {
  return `<p style="margin:24px 0 8px;text-align:center;">
  <a href="${escapeHtml(href)}" style="display:inline-block;background:${COLOR_PRIMARY};color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;">${escapeHtml(label)}</a>
</p>`;
}

export function htmlDetailsTable(rows: Array<{ label: string; value: string }>): string {
  const cells = rows
    .map(
      (row) => `<tr>
        <td style="padding:8px 0;font-size:13px;color:${COLOR_MUTED};vertical-align:top;width:42%;">${escapeHtml(row.label)}</td>
        <td style="padding:8px 0;font-size:14px;color:${COLOR_BROWN};vertical-align:top;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 20px;border-top:1px solid ${COLOR_BORDER};border-bottom:1px solid ${COLOR_BORDER};">${cells}</table>`;
}

export function htmlProminentTotal(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;background:#fdf2f6;border:1px solid ${COLOR_BORDER};border-radius:8px;">
  <tr>
    <td style="padding:14px 16px;font-size:14px;font-weight:bold;color:${COLOR_BROWN};">${escapeHtml(label)}</td>
    <td style="padding:14px 16px;font-size:18px;font-weight:bold;color:${COLOR_PRIMARY};text-align:right;">${escapeHtml(value)}</td>
  </tr>
</table>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function orderDetailsRows(ctx: OrderEmailContext): Array<{
  label: string;
  value: string;
}> {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Order number", value: ctx.orderNumber },
  ];

  if (ctx.createdAt) {
    rows.push({ label: "Order date", value: ctx.createdAt });
  }

  if (ctx.status) {
    rows.push({ label: "Status", value: formatOrderStatus(ctx.status) });
  }

  rows.push(
    { label: "Customer name", value: ctx.customerName },
    { label: "Phone", value: ctx.customerPhone },
  );

  if (ctx.customerEmail?.trim()) {
    rows.push({ label: "Email", value: ctx.customerEmail.trim() });
  }

  rows.push({ label: "Cake / product", value: ctx.cakeType });

  if (ctx.cakeSize?.trim()) {
    rows.push({ label: "Size / variant", value: ctx.cakeSize.trim() });
  }

  if (ctx.flavour?.trim()) {
    rows.push({ label: "Flavour", value: ctx.flavour.trim() });
  }

  if (ctx.messageOnCake?.trim()) {
    rows.push({ label: "Message on cake", value: ctx.messageOnCake.trim() });
  }

  if (ctx.designNotes?.trim()) {
    rows.push({ label: "Custom instructions", value: ctx.designNotes.trim() });
  }

  if (ctx.specialInstructions?.trim()) {
    rows.push({ label: "Customer notes", value: ctx.specialInstructions.trim() });
  }

  if (ctx.deliveryAddress?.trim()) {
    rows.push({ label: "Delivery address", value: ctx.deliveryAddress.trim() });
  }

  if (ctx.eventDate) {
    rows.push({ label: "Delivery / event date", value: ctx.eventDate });
  }

  rows.push(
    { label: "Payment method", value: formatPaymentMethod(ctx.paymentMethod) },
    { label: "Payment status", value: formatPaymentStatus(ctx.paymentStatus) },
  );

  if (ctx.totalAmount > 0 && ctx.quotedAmount != null && ctx.quotedAmount > 0) {
    rows.push({ label: "Subtotal", value: formatCurrency(ctx.totalAmount) });
  }

  return rows;
}

export function orderItemDetailRows(ctx: OrderEmailContext): Array<{
  label: string;
  value: string;
}> {
  if (!ctx.items.length) {
    return [{ label: "Items", value: "No item details available" }];
  }

  return ctx.items.map((item, index) => {
    const qty = Number.isFinite(item.quantity) ? item.quantity : 1;
    const unit = formatCurrency(item.unitPrice ?? 0);
    const lineTotal = formatCurrency((item.unitPrice ?? 0) * qty);
    let value = `${item.cakeName} — qty ${qty} — ${unit} each — line ${lineTotal}`;
    if (item.notes?.trim()) {
      value += ` — notes: ${item.notes.trim()}`;
    }
    return { label: `Item ${index + 1}`, value };
  });
}
