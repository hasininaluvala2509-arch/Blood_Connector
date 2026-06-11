import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// to connect routes
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in environment variables");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Serve frontend in production when `dist` is present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});