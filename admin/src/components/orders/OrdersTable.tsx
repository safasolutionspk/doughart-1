import { OrderCard } from "@/components/orders/OrderCard";
import type { Order } from "@/lib/orders/types";

type OrdersTableProps = {
  orders: Order[];
  onOrderUpdated?: (order: Order) => void;
  enableQuickStatus?: boolean;
};

export function OrdersTable({
  orders,
  onOrderUpdated,
  enableQuickStatus = false,
}: OrdersTableProps) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3">
      {orders.map((order) => (
        <li key={order._id} className="h-full">
          <OrderCard
            order={order}
            onUpdated={onOrderUpdated}
            enableQuickStatus={enableQuickStatus}
          />
        </li>
      ))}
    </ul>
  );
}
