import { Router } from "express";
import {
  createScan,
  claimScan,
  getScansByUser,
} from "../controllers/scanControllers.js";

const router = Router();

// Get Scans
router.post("/createScan", createScan);
router.put("/claimScan", claimScan);
router.post("/getScansByUser", getScansByUser);
// TODO: what happens if user tries to scan a code that does not exists in the database?
export default router;
