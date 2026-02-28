import express from "express";
import { login, register, syncUser } from "../controllers/auth.js";
import { validateRegister, validateLogin, validateSyncUser } from "../middlewares/validators.js";
const router = express.Router();

// Register new user
router.post("/register", validateRegister, register);

// Login user
router.post("/login", validateLogin, login);

// Sync user with Clerk
router.post("/sync-user", validateSyncUser, syncUser);

export default router;
