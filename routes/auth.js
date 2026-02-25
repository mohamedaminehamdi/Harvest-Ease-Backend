import express from "express";
import { login, register, syncUser } from "../controllers/auth.js";
const router = express.Router();

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Sync user with Clerk
router.post("/sync-user", syncUser);

export default router;
