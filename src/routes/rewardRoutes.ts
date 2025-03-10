import { Router, Request, Response } from "express";
import { getRewards } from "../controllers/rewardControllers.js";

const router = Router();

// Get Rewards
router.get("/getRewards", getRewards);

// Get Reward Points
router.get(
  "/rewardPoints",
  async (req: Request, res: Response): Promise<any> => {
    // TODO: Implement Function
    throw new Error("Unimplemented Function");
  }
);

// Redeem Reward Points
router.post("/reedem", async (req: Request, res: Response): Promise<any> => {
  // TODO: Implement Function
  throw new Error("Unimplemented Function");
});

export default router;
