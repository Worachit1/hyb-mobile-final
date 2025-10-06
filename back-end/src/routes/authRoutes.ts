import express from "express";
import { login, register, getProfile } from "../controllers/authController";
import {
  loginValidation,
  registerValidation,
} from "../middleware/authValidation";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/login", loginValidation, login);
router.post("/register", registerValidation, register);

// Protected routes
router.get("/profile", authenticateToken, getProfile);

export default router;
