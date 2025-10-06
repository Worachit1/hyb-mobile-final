import { Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";
import {
  generateToken,
  formatUserResponse,
  IAuthResponse,
} from "../models/Auth";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user);

    const response: IAuthResponse = {
      success: true,
      message: "Login successful",
      user: formatUserResponse(user),
      token,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save middleware
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    const response: IAuthResponse = {
      success: true,
      message: "Registration successful",
      user: formatUserResponse(user),
      token,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error("❌ Registration error:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // User should be attached by auth middleware
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: formatUserResponse(user),
    });
  } catch (error: any) {
    console.error("❌ Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
