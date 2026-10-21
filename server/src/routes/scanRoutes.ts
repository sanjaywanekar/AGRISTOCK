import { Router } from "express";
import { createScan, getScans } from "../controllers/scanController";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/", upload.single("image"), createScan);

router.get("/", getScans);

export default router;