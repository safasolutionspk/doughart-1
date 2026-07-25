import type { Request, Response } from "express";
import * as orderService from "../services/order.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getValidatedParam, getValidatedQuery } from "../utils/validatedRequest";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body, req.customer?.id);
  sendSuccess(res, order, "Order placed successfully", 201);
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listOrders(getValidatedQuery(req));
  sendSuccess(res, result.orders, "Orders retrieved", 200, {
    pagination: result.pagination,
  });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(getValidatedParam(req, "id"));
  sendSuccess(res, order, "Order retrieved");
});

export const getPublicOrderByNumber = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await orderService.getPublicOrderByOrderNumber(
      getValidatedParam(req, "orderNumber"),
      String(getValidatedQuery<{ phone: string }>(req).phone),
    );
    sendSuccess(res, order, "Order retrieved");
  },
);

export const lookupPublicOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.lookupPublicOrder(getValidatedQuery(req));
  sendSuccess(res, order, "Order retrieved");
});

export const updateOrderQuote = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderQuote(getValidatedParam(req, "id"), req.body);
  sendSuccess(res, order, "Quote updated");
});

export const getAdminOrderNotifications = asyncHandler(
  async (_req: Request, res: Response) => {
    const summary = await orderService.getAdminOrderNotifications();
    sendSuccess(res, summary, "Admin order notifications retrieved");
  },
);

export const markOrdersViewed = asyncHandler(async (req: Request, res: Response) => {
  const summary = await orderService.markOrdersViewed(req.body);
  sendSuccess(res, summary, "Orders marked as viewed");
});

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await orderService.updateOrderStatus(
      getValidatedParam(req, "id"),
      req.body,
    );
    sendSuccess(res, order, "Order updated");
  },
);
