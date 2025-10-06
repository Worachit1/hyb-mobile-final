import jwt from "jsonwebtoken";
import { IUser } from "./User";

export interface IAuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  token?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IJWTPayload {
  userId: string;
  email: string;
}

// JWT utility functions
export const generateToken = (user: IUser): string => {
  const payload: IJWTPayload = {
    userId: (user._id as any).toString(),
    email: user.email,
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" } // Token expires in 7 days
  );
};

export const verifyToken = (token: string): IJWTPayload => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key"
  ) as IJWTPayload;
};

export const formatUserResponse = (user: IUser) => {
  return {
    id: (user._id as any).toString(),
    name: user.name,
    email: user.email,
  };
};
