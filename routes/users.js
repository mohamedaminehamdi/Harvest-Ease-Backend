import express from "express";
import { getUserProfile, updateUserProfile, changePassword, deleteAccount } from "../controllers/userController.js";
import { validateUpdateProfile } from "../middlewares/validators.js";

const router = express.Router();

router.get("/profile", getUserProfile);
router.get("/profile/:userId", getUserProfile);
router.put("/profile/:userId", validateUpdateProfile, updateUserProfile);
router.post("/change-password", changePassword);
router.delete("/profile", deleteAccount);

export default router;
