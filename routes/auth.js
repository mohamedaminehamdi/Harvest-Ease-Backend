import express from "express";
import { login, register, syncUser } from "../controllers/auth.js";
import { validateRegister, validateLogin } from "../middlewares/validators.js";
const router = express.Router();

// Register new user
router.post("/register", validateRegister, register);

// Login user
router.post("/login", validateLogin, login);

// Exchange a Clerk session (Authorization: Bearer <Clerk JWT>) for a backend token
router.post("/sync-user", syncUser);

export default router;
