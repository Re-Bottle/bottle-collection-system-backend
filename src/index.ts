import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes"; // Adjust the path based on your directory structure
import deviceRoutes from "./routes/deviceRoutes";
import rewardRoutes from "./routes/rewardRoutes";

const app = express();

// Middleware
app.use(express.json()); // For parsing JSON bodies
app.use(cookieParser()); // For cookie parsing
app.use(cors({ credentials: true, origin: "http://localhost:3001", methods: ['GET', 'POST'], })); // For allowing cross-origin requests

// Authentication routes
app.use("/auth", authRoutes);

// Device Routes
app.use("/device", deviceRoutes);

// Reward Routes
app.use("/Reward", rewardRoutes);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

// Set the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
