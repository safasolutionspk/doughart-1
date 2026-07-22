import { Router } from "express";
import {
  handleEasypaisaWebhook,
  handleJazzcashWebhook,
} from "../controllers/paymentWebhook.controller";

const router = Router();

/** Placeholder webhook endpoints — configure in JazzCash / EasyPaisa dashboards when going live */
router.post("/jazzcash", handleJazzcashWebhook);
router.post("/easypaisa", handleEasypaisaWebhook);

export default router;
