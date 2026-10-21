
import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboardController";
import {
  authMiddleware,
  requireRole,
} from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(requireRole(["ADMIN", "INDUSTRIALIST"]));

router.get("/", getDashboardMetrics);

export default router;
