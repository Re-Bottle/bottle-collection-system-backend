import { Request, Response } from "express";
import DynamoDB from "../repository/dynamoDB.js";
import RepositoryInterface from "../repository/repositoryInterface.js";

const repository: RepositoryInterface = DynamoDB.getInstance();

export const getScans = async (req: Request, res: Response): Promise<any> => {
  const scans = await repository.getScans();
  if (!scans)
    return res.status(200).json({ message: "No scans found", scans: [] });
  return res.status(200).json({ scans });
};

export const createScan = async (req: Request, res: Response): Promise<any> => {
  const { deviceId, scanData } = req.body;
  if (!deviceId || !scanData)
    return res.status(400).json({ message: "Missing required fields" });
  const scan = await repository.createScan(deviceId, scanData);
  return res.status(200).json({ scan });
};

export const claimScan = async (req: Request, res: Response): Promise<any> => {
  const { claimedBy, scanData } = req.body;
  console.log("flag0: ", claimedBy, scanData);
  if (!claimedBy || !scanData)
    return res.status(400).json({ message: "Missing required fields" });

  const scan = await repository.getScanByData(scanData);
  if (!scan) return res.status(404).json({ message: "Scan not found" });
  console.log("flag1: ", scan);
  console.log(
    "flag2: ",
    scan[0].id,
    scan[0].scanData,
    scan[0].claimedBy,
    scan[0].timestamp
  );
  if (scan[0].claimedBy !== "unclaimed") {
    return res.status(400).json({ message: "Scan has already been claimed" });
  }
  console.log("flag1: ", scan);
  const currentTime = new Date().getTime();
  const scanTimestamp = scan[0].timestamp
    ? new Date(scan[0].timestamp).getTime()
    : NaN;

  console.log("flag2: ", scanTimestamp);
  if (isNaN(scanTimestamp)) {
    return res.status(400).json({ message: "Invalid scan timestamp" });
  }
  const timeDifference = (currentTime - scanTimestamp) / 1000 / 60; // time difference in minutes

  console.log("flag3: ", timeDifference);
  if (timeDifference > 10)
    return res
      .status(400)
      .json({ message: "Scan cannot be claimed after 10 minutes" });
  try {
    const updatedScan = await repository.updateScanUserId(
      scan[0].id,
      claimedBy
    );
    return res
      .status(200)
      .json({ message: "Scan has been claimed", scan: updatedScan });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getScansByUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ message: "User ID missing" });
  const scans = await repository.getScansByUser(userId);
  if (!scans)
    return res.status(204).json({ message: "No scans found", scans: [] });
  return res.status(200).json({ scans });
};
