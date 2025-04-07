import { Request, Response } from "express";
import DynamoDB from "../repository/dynamoDB.js";
import RepositoryInterface from "../repository/repositoryInterface.js";

const repository: RepositoryInterface = DynamoDB.getInstance();

export const createScan = async (req: Request, res: Response): Promise<any> => {
  const { deviceId, scanData, bottleType } = req.body;
  if (!deviceId || !scanData || !bottleType)
    return res.status(400).json({ message: "Missing required fields" });
  const scan = await repository.createScan(deviceId, scanData, bottleType);
  return res.status(200).json({ scan });
};

export const claimScan = async (req: Request, res: Response): Promise<any> => {
  const { claimedBy, scanData } = req.body;
  if (!claimedBy || !scanData)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const scan = await repository.getScanByData(scanData);
    if (!scan || scan.length === 0) {
      return res.status(404).json({ message: "Scan not found" });
    }

    if (scan[0].claimedBy !== "unclaimed") {
      return res.status(400).json({ message: "Scan has already been claimed" });
    }

    const currentTime = new Date().getTime();
    const scanTimestamp = scan[0].timestamp
      ? new Date(scan[0].timestamp).getTime()
      : NaN;

    if (isNaN(scanTimestamp)) {
      return res.status(400).json({ message: "Invalid scan timestamp" });
    }
    
    const timeDifference = (currentTime - scanTimestamp) / 1000 / 60; // time difference in minutes

    if (timeDifference > 10)
      return res.status(400).json({ message: "Scan cannot be claimed after 10 minutes" });
        
    const result = await repository.updateScanUserId(scan[0].id, claimedBy);
    return res.status(200).json({ 
      message: "Scan has been claimed", 
      scan: result.scan,
      user: {
        totalPoints: result.user.totalPoints,
        totalBottles: result.user.totalBottles
      }
    });
  } catch (error) {
    console.error('Error claiming scan:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getScansByUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ message: "User ID missing" });
  try {
    const scans = await repository.getScansByUser(userId);
    if (!scans || scans.length === 0) {
      return res.status(204).json({ message: "No scans found", scans: [] });
    }
    return res.status(200).json({ scans });
  } catch (error) {
    console.error('Error getting scans:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteScan = async (req: Request, res: Response): Promise<any> => {
  const { scanId } = req.body;
  if (!scanId) return res.status(400).json({ message: "Scan ID missing" });
  const scan = await repository.getScanById(scanId);
  if (!scan) return res.status(404).json({ message: "Scan not found" });
  try {
    await repository.deleteScan(scanId);
    return res.status(200).json({ message: "Scan deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
