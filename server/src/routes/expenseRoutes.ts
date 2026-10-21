
import { Router } from "express";
import {
  createExpense,
  getExpenses,
} from "../controllers/expenseController";
import {
  authMiddleware,
  requireRole,
} from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(requireRole(["ADMIN", "INDUSTRIALIST"]));

router.get("/", getExpenses);
router.post("/", createExpense);

export default router;
