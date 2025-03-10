import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js"; // Adjust the path based on your directory structure
import deviceRoutes from "./routes/deviceRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";
import { authenticateJWT } from "./utils/authUtils.js";

const app = express();

// Middleware
app.use(express.json()); // For parsing JSON bodies
app.use(cookieParser()); // For cookie parsing
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  })
); // For allowing cross-origin requests

// Authentication routes
app.use("/auth", authRoutes);

// Device Routes
app.use("/device", deviceRoutes);

// Reward Routes
app.use("/reward", rewardRoutes);

// Scan Routes
app.use("/scan", scanRoutes);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/authenticateJWT", authenticateJWT, (req, res) => {
  res.sendStatus(200);
});

// Set the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
