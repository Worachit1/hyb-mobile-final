import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
} from "../controllers/userController";
import { validateCreateUser } from "../middleware/validation";
import { handleValidationErrors } from "../middleware/errorHandler";

const router = Router();

// Create user with validation
router.post("/create", validateCreateUser, handleValidationErrors, createUser);

// Get all users with pagination
router.get("/list", getUsers);

// Get user by ID
router.get("/:id", getUserById);

export default router;
