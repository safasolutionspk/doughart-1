import { Order } from "../models";
import type { DashboardAnalytics } from "../types/dashboardAnalytics";

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [totalOrders, pendingOrders] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
  ]);

  return {
    totalOrders,
    pendingOrders,
  };
}
