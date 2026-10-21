import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/* ROUTE IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import authRoutes from "./routes/authRoutes";
import { authMiddleware, requireRole } from "./middleware/authMiddleware";
import scanRoutes from "./routes/scanRoutes";
import salesRoutes from "./routes/salesRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import adminRoutes from "./routes/adminRoutes";
/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/uploads", express.static("uploads"));

// Public
app.use("/auth", authRoutes);

/* ROUTES */
app.use("/dashboard", authMiddleware, requireRole(["ADMIN", "INDUSTRIALIST"]), dashboardRoutes);
app.use("/products", authMiddleware, requireRole(["ADMIN", "INDUSTRIALIST"]), productRoutes);
app.use("/users", authMiddleware, requireRole(["ADMIN", "INDUSTRIALIST"]), userRoutes);
app.use("/expenses", authMiddleware, requireRole(["ADMIN", "INDUSTRIALIST"]), expenseRoutes);

// Farmer scan
app.use(
  "/scans",
  authMiddleware,
  requireRole(["FARMER"]),
  scanRoutes
);

app.use(
  "/sales",
  authMiddleware,
  requireRole(["ADMIN", "INDUSTRIALIST"]),
  salesRoutes
);

app.use(
  "/purchases",
  authMiddleware,
  requireRole(["ADMIN", "INDUSTRIALIST"]),
  purchaseRoutes
);

app.use(
  "/admin",
  authMiddleware,
  requireRole(["ADMIN"]),
  adminRoutes
);

/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
