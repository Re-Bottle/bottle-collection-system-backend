import { Router } from "express";
import {
  createReward,
  getRewards,
  updateReward,
  deleteReward,
} from "../controllers/rewardControllers.js";

const router = Router();

/**
 * @route POST /createReward
 * @description Creates a new reward entry in the database.
 * @access Public or Protected (depending on your authentication setup)
 */
router.post("/createReward", createReward);

/**
 * @route PUT /updateReward/:id
 * @description Updates an existing reward identified by its ID.
 * @param {string} id - The unique identifier of the reward to update.
 * @access Public or Protected
 */
router.put("/updateReward/:id", updateReward);

/**
 * @route GET /getRewards
 * @description Fetches a list of all available rewards.
 * @access Public or Protected
 */
router.get("/getRewards", getRewards);

/**
 * @route DELETE /deleteReward/:id
 * @description Deletes a specific reward from the database.
 * @param {string} id - The unique identifier of the reward to delete.
 * @access Public or Protected
 */
router.delete("/deleteReward/:id", deleteReward);

export default router;
