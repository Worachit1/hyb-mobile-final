import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../models/Auth";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    const decoded = verifyToken(token);
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error: any) {
    console.error("❌ Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token has expired",
      });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
