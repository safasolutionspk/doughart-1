import { Order } from "../models";
import type { DashboardAnalytics } from "../types/dashboardAnalytics";

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [
    totalOrders,
    pendingOrders,
    paidOrders,
    unpaidOrders,
    revenueAgg,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ paymentStatus: "paid" }),
    Order.countDocuments({ paymentStatus: "pending" }),
    Order.aggregate<{
      totalRevenue: number;
      paidRevenue: number;
      unpaidRevenue: number;
    }>([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $addFields: {
          effectiveAmount: {
            $cond: [
              { $gt: ["$quotedAmount", 0] },
              "$quotedAmount",
              "$totalAmount",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$effectiveAmount" },
          paidRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "paid"] },
                "$effectiveAmount",
                0,
              ],
            },
          },
          unpaidRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "pending"] },
                "$effectiveAmount",
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const revenue = revenueAgg[0] ?? {
    totalRevenue: 0,
    paidRevenue: 0,
    unpaidRevenue: 0,
  };

  return {
    totalOrders,
    pendingOrders,
    paidOrders,
    unpaidOrders,
    totalRevenue: revenue.totalRevenue,
    paidRevenue: revenue.paidRevenue,
    unpaidRevenue: revenue.unpaidRevenue,
  };
}
