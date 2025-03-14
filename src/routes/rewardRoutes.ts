import { Router } from "express";
import {
  createReward,
  getRewards,
  getRewardById,
  updateReward,
  deleteReward,
} from "../controllers/rewardControllers.js";

const router = Router();

// Create Reward
router.post("/createReward", createReward);

// Update Reward
router.put("/updateReward/:id", updateReward);

// Get Rewards
router.get("/getRewards", getRewards);

// Get Reward by ID
router.get("/getRewardById/", getRewardById);

// Delete Reward
router.delete("/deleteReward/:id", deleteReward);

export default router;
