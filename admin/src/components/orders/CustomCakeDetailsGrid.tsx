import type { ReactNode } from "react";
import {
  dashOr,
  parseCustomCakeNotes,
  resolveCustomCakeReferenceImage,
} from "@/lib/orders/customCake";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatOrderStatus,
  formatPaymentMethod,
} from "@/lib/orders/format";
import type { Order } from "@/lib/orders/types";
import { ReferenceImagePreview } from "@/components/orders/ReferenceImagePreview";

type CustomCakeDetailsGridProps = {
  order: Order;
};

export function CustomCakeDetailsGrid({ order }: CustomCakeDetailsGridProps) {
  const parsed = parseCustomCakeNotes(order.specialInstructions);
  const referenceImage = resolveCustomCakeReferenceImage(order);
  const approvedPrice =
    order.quotedAmount != null && order.quotedAmount > 0
      ? formatCurrency(order.quotedAmount)
      : "—";

  return (
    <div className="space-y-4 text-xs">
      <DetailsSection title="Customer">
        <DetailItem label="Name" value={dashOr(order.customerName)} />
        <DetailItem label="Phone" value={dashOr(order.customerPhone)} />
        <DetailItem label="Email" value={order.customerEmail?.trim() ? order.customerEmail.trim() : "Not provided"} />
        <DetailItem label="Address" value={dashOr(order.deliveryAddress)} />
      </DetailsSection>

      <DetailsSection title="Cake details">
        <DetailItem label="Cake type" value={dashOr(order.cakeType)} />
        <DetailItem label="Shape" value="—" />
        <DetailItem label="Pounds" value={dashOr(order.cakeSize)} />
        <DetailItem label="Flavor" value={dashOr(order.flavour)} />
        <DetailItem label="Delivery date" value={formatDate(order.eventDate)} />
        <DetailItem label="Message on cake" value={dashOr(order.messageOnCake)} />
        <DetailItem label="Gift text" value={dashOr(parsed.giftNote)} />
        <DetailItem label="Additional notes" value={dashOr(parsed.extraNotes)} className="sm:col-span-2" />
        {parsed.referenceLink ? (
          <DetailItem
            label="Reference link"
            value={
              <a
                href={parsed.referenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-brand-primary underline"
              >
                {parsed.referenceLink}
              </a>
            }
            className="sm:col-span-2"
          />
        ) : (
          <DetailItem label="Reference link" value="—" className="sm:col-span-2" />
        )}
        <div className="sm:col-span-2">
          <ReferenceImagePreview source={referenceImage} />
        </div>
      </DetailsSection>

      <DetailsSection title="Order / payment">
        <DetailItem label="Order reference" value={dashOr(order.orderNumber)} />
        <DetailItem
          label="Payment option"
          value={formatPaymentMethod(order.paymentMethod ?? "cash_on_delivery")}
        />
        <DetailItem label="Order status" value={formatOrderStatus(order.status)} />
        <DetailItem label="Approved price" value={approvedPrice} />
        <DetailItem label="Created date" value={formatDateTime(order.createdAt)} />
      </DetailsSection>
    </div>
  );
}

function DetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
        {title}
      </p>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-medium text-brand-muted">{label}</dt>
      <dd className="mt-0.5 font-medium leading-relaxed text-brand-brown">{value}</dd>
    </div>
  );
}
