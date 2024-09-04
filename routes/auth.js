import express from "express";
import { login, register } from "../controllers/auth.js";
import { validateRegister, validateLogin } from "../middlewares/validators.js";
const router = express.Router();

// Register new user
router.post("/register", validateRegister, register);

// Login user
router.post("/login", validateLogin, login);

export default router;
