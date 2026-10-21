import { Router } from "express";
import {
  createPurchase,
  getPurchases,
} from "../controllers/purchaseController";

const router = Router();

router.get("/", getPurchases);
router.post("/", createPurchase);

export default router;