"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authController_1 = require("../controllers/authController");
const authUtils_1 = require("../utils/authUtils");
const router = (0, express_1.Router)();
const SECRET_KEY = process.env.SECRET_KEY ||
    "8e0f16e244aeb7b71fa3ab9299db3bc3e465d2b91962a5b4890c86b1da6c7fc1";
// Signup route for a vendor
router.post("/signupVendor", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        // Check if the user already exists
        const userExists = (0, authController_1.findVendorByEmail)(email);
        if (userExists) {
            return res.status(400).json({ message: "Vendor already exists" });
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create the user
        const newUser = (0, authController_1.createVendor)(email, hashedPassword, name);
        return res
            .status(201)
            .json({ message: "Vendor created successfully", user: newUser });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Login route
router.post("/loginVendor", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find the user by email
        const user = (0, authController_1.findVendorByEmail)(email);
        if (!user) {
            return res.status(400).json({ message: "Vendor not found" });
        }
        // Check if password is correct
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Create a JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email }, SECRET_KEY, {
            expiresIn: "1h",
        });
        console.log("token while login: ", token);
        // Set the token as a cookie
        res.cookie("auth_token", token, {
        // httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // sameSite: 'lax'
        });
        return res.json({
            message: "Login successful",
            email,
            id: user.id,
            name: user.name,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Signup route for users
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        // Check if the user already exists
        const userExists = (0, authController_1.findUserByEmail)(email);
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create the user
        const newUser = (0, authController_1.createUser)(email, hashedPassword, name);
        return res
            .status(201)
            .json({ message: "User created successfully", user: { id: newUser.id } });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Login route for users
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find the user by email
        const user = (0, authController_1.findUserByEmail)(email);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Check if password is correct
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Create a JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email }, SECRET_KEY, {
            expiresIn: "1h",
        });
        // Set the token as a cookie
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
        return res.json({
            message: "Login successful",
            email,
            id: user.id,
            name: user.name,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Logout route
router.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("auth_token");
    return res.json({ message: "Logged out successfully" });
}));
// // Get User Details
router.get("/user", authUtils_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user == undefined) {
        return res.status(404).json({ message: "User details missing" });
    }
    try {
        const userId = req.user.id; // Assuming user ID is stored in req.user by middleware
        const user = (0, authController_1.findUserById)(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}));
// Update User Details
router.post("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement Function
    throw new Error("Unimplemented Function");
}));
exports.default = router;
