"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes")); // Adjust the path based on your directory structure
const deviceRoutes_1 = __importDefault(require("./routes/deviceRoutes"));
const rewardRoutes_1 = __importDefault(require("./routes/rewardRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json()); // For parsing JSON bodies
app.use((0, cookie_parser_1.default)()); // For cookie parsing
app.use((0, cors_1.default)({ credentials: true, origin: "http://localhost:3001", methods: ['GET', 'POST'], })); // For allowing cross-origin requests
// Authentication routes
app.use("/auth", authRoutes_1.default);
// Device Routes
app.use("/device", deviceRoutes_1.default);
// Reward Routes
app.use("/Reward", rewardRoutes_1.default);
app.get("/", (req, res) => {
    res.sendStatus(200);
});
// Set the port
const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
