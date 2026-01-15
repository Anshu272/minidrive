import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/files.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// 🔹 MIDDLEWARES (ORDER MATTERS)
app.use(cors({
  origin: "https://minidrive-two.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ FIXED: Changed '*' to ':path*' for Express 5 / Node 22 compatibility
app.options("/api/files/:path*", cors());

app.use(express.json());           
app.use(cookieParser());            


mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});