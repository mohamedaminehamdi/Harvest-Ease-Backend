import express from "express";
import { analyzePlantHealth, getPlantInfo } from "../controllers/healthController.js";

const router = express.Router();

router.post("/analyze", analyzePlantHealth);
router.get("/plant-info/:plantType", getPlantInfo);

export default router;
