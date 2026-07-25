import { Router } from "express";
import {
  createOrder,
  getAdminOrderNotifications,
  getOrder,
  getPublicOrderByNumber,
  listOrders,
  lookupPublicOrder,
  markOrdersViewed,
  updateOrderQuote,
  updateOrderStatus,
} from "../controllers/order.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { requireCustomerForOrder } from "../middleware/requireCustomerForOrder";
import { adminWriteLimiter, orderCreateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  listOrdersQuerySchema,
  lookupOrderQuerySchema,
  orderIdParamSchema,
  orderNumberParamSchema,
  publicOrderPhoneQuerySchema,
  publicCreateOrderSchema,
  updateOrderQuoteSchema,
  updateOrderStatusSchema,
  markOrdersViewedSchema,
} from "../validators/order.validator";

const router = Router();

router.post(
  "/",
  orderCreateLimiter,
  requireCustomerForOrder,
  validate(publicCreateOrderSchema),
  createOrder,
);

router.get(
  "/public/lookup",
  orderCreateLimiter,
  validate(lookupOrderQuerySchema, "query"),
  lookupPublicOrder,
);

router.get(
  "/public/:orderNumber",
  validate(orderNumberParamSchema, "params"),
  validate(publicOrderPhoneQuerySchema, "query"),
  getPublicOrderByNumber,
);

router.get(
  "/",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  validate(listOrdersQuerySchema, "query"),
  listOrders,
);

router.get(
  "/admin/notifications",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  getAdminOrderNotifications,
);

router.patch(
  "/admin/mark-viewed",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  validate(markOrdersViewedSchema),
  markOrdersViewed,
);

router.get(
  "/:id",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  validate(orderIdParamSchema, "params"),
  getOrder,
);

router.patch(
  "/:id/quote",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  validate(orderIdParamSchema, "params"),
  validate(updateOrderQuoteSchema),
  updateOrderQuote,
);

router.patch(
  "/:id/status",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  validate(orderIdParamSchema, "params"),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);

export default router;
