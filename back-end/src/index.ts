import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { requestLogger } from "./middleware/logger";

dotenv.config();
const app = express();

// CORS configuration - Allow all origins for development
const corsOptions = {
  origin: true, // Allow all origins for Expo development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Debug middleware for network requests
app.use((req, res, next) => {
  console.log(
    `🔍 [${new Date().toISOString()}] ${req.method} ${req.url} from ${
      req.ip || req.connection.remoteAddress
    }`
  );
  next();
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = parseInt(process.env.PORT || "5000", 10);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    // Listen on all interfaces (0.0.0.0) to allow network access
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `🌐 Network health check: http://10.30.132.39:${PORT}/api/health`
      );
      console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(
        `🌐 Network Users API: http://10.30.132.39:${PORT}/api/users`
      );
      console.log(`🌐 Network Auth API: http://10.30.132.39:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
