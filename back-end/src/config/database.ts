import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/hyb-mobile-app";

    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");
    console.log(
      `📍 Connected to: ${mongoURI.split("@")[1] || "local database"}`
    );
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

export default connectDB;
