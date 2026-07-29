import { Router } from "express";
import analyticsRoutes from "./analytics.routes";
import authRoutes from "./auth.routes";
import customerRoutes from "./customer.routes";
import cakeRoutes from "./cake.routes";
import categoryRoutes from "./category.routes";
import galleryRoutes from "./gallery.routes";
import healthRoutes from "./health.routes";
import newsletterRoutes from "./newsletter.routes";
import contactRoutes from "./contact.routes";
import orderRoutes from "./order.routes";
import reviewRoutes from "./review.routes";
import settingsRoutes from "./settings.routes";
import uploadRoutes from "./upload.routes";
import { attachTenantContext } from "../middleware/tenantContext";

const router = Router();

router.use(attachTenantContext);

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/orders", orderRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/categories", categoryRoutes);
router.use("/cakes", cakeRoutes);
router.use("/gallery", galleryRoutes);
router.use("/uploads", uploadRoutes);
router.use("/settings", settingsRoutes);
router.use("/reviews", reviewRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/contact", contactRoutes);

export default router;
