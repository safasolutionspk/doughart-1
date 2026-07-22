import { OrdersListView } from "@/components/orders/OrdersListView";

export default function CancelledOrdersPage() {
  return (
    <OrdersListView
      defaultStatus="cancelled"
      lockStatus
      title="Cancelled orders"
      description="Orders that were cancelled."
    />
  );
}
