
import { Router } from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { upload } from "../middleware/upload";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Keep product listing available to the existing application.
router.get("/", getProducts);

// Product creation requires an authenticated industrialist or admin.
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "INDUSTRIALIST"]),
  upload.single("image"),
  createProduct
);

// Update existing product details, stock, price, or image.
router.patch(
  "/:productId",
  authMiddleware,
  requireRole(["ADMIN", "INDUSTRIALIST"]),
  upload.single("image"),
  updateProduct
);

// Delete a product when it has no transaction history.
router.delete(
  "/:productId",
  authMiddleware,
  requireRole(["ADMIN", "INDUSTRIALIST"]),
  deleteProduct
);

export default router;
