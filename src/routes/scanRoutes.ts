import { Router } from "express";
import {
  createScan,
  claimScan,
  getScansByUser,
  deleteScan,
} from "../controllers/scanControllers.js";

const router = Router();

/**
 * @route POST /createScan
 * @description Creates a new scan entry in the database.
 * @access Public or Protected (depending on authentication)
 */
router.post("/createScan", createScan);

/**
 * @route PUT /claimScan
 * @description Marks a scan as claimed by the user.
 * @access Public or Protected
 */
router.put("/claimScan", claimScan);

/**
 * @route POST /getScansByUser
 * @description Retrieves all scans associated with a specific user.
 * @access Public or Protected
 */
router.post("/getScansByUser", getScansByUser);

/**
 * @route DELETE /deleteScan
 * @description Deletes a scan from the database.
 * @access Public or Protected
 */
router.delete("/deleteScan", deleteScan);

/**
 * TODO: Handle case where a user tries to scan a code that does not exist in the database.
 * Potential solution:
 * - Return an appropriate error response if the scanned code is not found.
 * - Optionally, allow users to add new scans if they are missing.
 */

export default router;
