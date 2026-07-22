import { OrdersListView } from "@/components/orders/OrdersListView";

export default function CompletedOrdersPage() {
  return (
    <OrdersListView
      defaultStatus="completed"
      lockStatus
      title="Completed orders"
      description="Successfully delivered and completed orders."
    />
  );
}
