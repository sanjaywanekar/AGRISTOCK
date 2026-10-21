
import { Router } from "express";
import {
  getUsers,
  createIndustrialist,
} from "../controllers/userController";
import {
  authMiddleware,
  requireRole,
} from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  requireRole(["ADMIN"]),
  getUsers
);

router.post(
  "/industrialists",
  requireRole(["ADMIN"]),
  createIndustrialist
);

export default router;
