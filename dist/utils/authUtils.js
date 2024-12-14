"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.auth_token;
    console.log("Cookies: ", req.cookies);
    if (!token) {
        console.log("No token provided");
        res.status(403).json({ message: "No token provided" });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY ||
        "8e0f16e244aeb7b71fa3ab9299db3bc3e465d2b91962a5b4890c86b1da6c7fc1", (err, decoded) => {
        if (err) {
            res.status(403).json({ message: "Invalid or expired token" });
            return;
        }
        req.user = decoded; // Ensure decoded is typed as User
        next();
    });
};
exports.authenticateJWT = authenticateJWT;
