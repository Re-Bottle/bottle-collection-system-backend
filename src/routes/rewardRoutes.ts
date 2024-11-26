import { Router, Request, Response } from "express";

const router = Router();

// Get Rewards
router.get("/rewards", async (req: Request, res: Response): Promise<any> => {
  // TODO: Implement Function
  throw new Error("Unimplemented Function");
});

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
