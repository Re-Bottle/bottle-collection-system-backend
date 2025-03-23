import { Router } from "express";
import {
  createScan,
  claimScan,
  getScansByUser,
  deleteScan,
} from "../controllers/scanControllers.js";

const router = Router();

// Get Scans
router.post("/createScan", createScan);

// Claim Scan
router.put("/claimScan", claimScan);

// Get Scans by User
router.post("/getScansByUser", getScansByUser);

// Delete Scan
router.delete("/deleteScan", deleteScan);
// TODO: what happens if user tries to scan a code that does not exists in the database?
export default router;
