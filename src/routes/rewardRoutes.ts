import { Router } from "express";
import {
  createReward,
  getRewards,
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

// Delete Reward
router.delete("/deleteReward/:id", deleteReward);

export default router;
