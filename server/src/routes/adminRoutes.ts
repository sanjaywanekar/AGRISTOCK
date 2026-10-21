import { Router } from "express";

import {
  getAdminStats,
  getIndustrialists,
  getIndustrialist,
  getIndustrialistDashboard,
  getIndustrialistProducts,
  getIndustrialistSales,
  getIndustrialistPurchases,
  getIndustrialistExpenses,
  getFarmers,
  getFarmer,
  getFarmerScans,
  getFarmerScan,
  createIndustrialistProduct,
  updateIndustrialistProduct,
  deleteIndustrialistProduct,
} from "../controllers/adminController";

const router = Router();

router.get("/stats", getAdminStats);

router.get("/industrialists", getIndustrialists);

router.get(
  "/industrialists/:id",
  getIndustrialist
);

router.get(
  "/industrialists/:id/dashboard",
  getIndustrialistDashboard
);

router.get(
  "/industrialists/:id/products",
  getIndustrialistProducts
);

router.post(
  "/industrialists/:id/products",
  createIndustrialistProduct
);

router.put(
  "/industrialists/:id/products/:productId",
  updateIndustrialistProduct
);

router.delete(
  "/industrialists/:id/products/:productId",
  deleteIndustrialistProduct
);

router.get(
  "/industrialists/:id/sales",
  getIndustrialistSales
);

router.get(
  "/industrialists/:id/purchases",
  getIndustrialistPurchases
);

router.get(
  "/industrialists/:id/expenses",
  getIndustrialistExpenses
);

router.get("/farmers", getFarmers);

router.get(
  "/farmers/:id",
  getFarmer
);

router.get(
  "/farmers/:id/scans",
  getFarmerScans
);
export default router;

router.get(
  "/farmers/:id/scans/:scanId",
  getFarmerScan
);