import express from "express";
import {
  addResourceUsage,
  getResourceUsage,
  updateResourceUsage,
  deleteResourceUsage,
} from "../controllers/resourcesController.js";

const router = express.Router();

router.get("/usage", getResourceUsage);
router.post("/usage", addResourceUsage);
router.put("/usage/:id", updateResourceUsage);
router.delete("/usage/:id", deleteResourceUsage);

export default router;
