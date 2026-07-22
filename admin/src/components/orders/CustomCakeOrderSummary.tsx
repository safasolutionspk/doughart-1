import {
  dashOr,
  parseCustomCakeNotes,
} from "@/lib/orders/customCake";
import {
  formatCurrency,
  formatDate,
  formatOrderStatus,
  formatPaymentMethod,
  formatPaymentStatus,
} from "@/lib/orders/format";
import type { Order } from "@/lib/orders/types";

type CustomerFields = "all" | "address-only" | "none";

type CustomCakeOrderSummaryProps = {
  order: Order;
  customerFields?: CustomerFields;
};

export function CustomCakeOrderSummary({
  order,
  customerFields = "all",
}: CustomCakeOrderSummaryProps) {
  const parsed = parseCustomCakeNotes(order.specialInstructions);
  const approvedPrice =
    order.quotedAmount != null && order.quotedAmount > 0
      ? formatCurrency(order.quotedAmount)
      : "—";

  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      {customerFields === "all" ? (
        <>
          <SummaryItem label="Name" value={dashOr(order.customerName)} className="col-span-2" />
          <SummaryItem label="Phone" value={dashOr(order.customerPhone)} />
          <SummaryItem label="Address" value={dashOr(order.deliveryAddress)} />
        </>
      ) : customerFields === "address-only" ? (
        <SummaryItem
          label="Address"
          value={dashOr(order.deliveryAddress)}
          className="col-span-2"
        />
      ) : null}

      <SummaryItem label="Cake type" value={dashOr(order.cakeType)} />
      <SummaryItem label="Pounds" value={dashOr(order.cakeSize)} />
      <SummaryItem label="Flavor" value={dashOr(order.flavour)} />
      <SummaryItem label="Shape" value="—" />
      <SummaryItem label="Delivery" value={formatDate(order.eventDate)} />
      <SummaryItem
        label="Message"
        value={dashOr(order.messageOnCake)}
        className="col-span-2"
      />
      <SummaryItem
        label="Gift text"
        value={dashOr(parsed.giftNote)}
        className="col-span-2"
      />
      <SummaryItem
        label="Notes"
        value={dashOr(parsed.extraNotes)}
        className="col-span-2"
      />
      <SummaryItem label="Payment" value={formatPaymentMethod(order.paymentMethod)} />
      <SummaryItem
        label="Payment status"
        value={formatPaymentStatus(order.paymentStatus ?? "pending")}
      />
      <SummaryItem label="Order status" value={formatOrderStatus(order.status)} />
      <SummaryItem label="Approved price" value={approvedPrice} />
    </dl>
  );
}

function SummaryItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-medium text-brand-muted">{label}</dt>
      <dd className="line-clamp-2 font-medium text-brand-brown">{value}</dd>
    </div>
  );
}
