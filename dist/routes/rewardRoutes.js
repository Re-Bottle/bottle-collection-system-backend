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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Get Rewards
router.get("/rewards", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement Function
    throw new Error("Unimplemented Function");
}));
// Get Reward Points
router.get("/rewardPoints", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement Function
    throw new Error("Unimplemented Function");
}));
// Redeem Reward Points
router.post("/reedem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement Function
    throw new Error("Unimplemented Function");
}));
exports.default = router;
