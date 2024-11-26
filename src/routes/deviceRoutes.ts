import { Router, Request, Response } from "express";

const router = Router();




// Generate Unique Device id
router.post(
  "/generateId",
  async (req: Request, res: Response): Promise<any> => {
    // TODO: Implement Function
    throw new Error("Unimplemented Function");
  }
);

// Add Scanned Bottle
router.post(
  "/createScan",
  async (req: Request, res: Response): Promise<any> => {
    // TODO: Implement Function
    throw new Error("Unimplemented Function");
  }
);

export default router;
