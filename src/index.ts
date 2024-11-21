import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes"; // Adjust the path based on your directory structure

const app = express();

// Middleware
app.use(express.json()); // For parsing JSON bodies
app.use(cookieParser()); // For cookie parsing

// Use authentication routes
app.use("/auth", authRoutes); // Mount the routes under /auth path

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Set the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
