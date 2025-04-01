import { Request, Response } from "express";
import type { Reward } from "../types/express.d.ts";
import DynamoDB from "../repository/dynamoDB.js";
import RepositoryInterface from "../repository/repositoryInterface.js";

const repository: RepositoryInterface = DynamoDB.getInstance();

export const createReward = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { rewardName, rewardDescription, rewardPoints, redeemBy } = req.body;

  if (!rewardName || !rewardDescription || !rewardPoints || !redeemBy) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const reward: Reward = await repository.createReward(
    rewardName,
    rewardDescription,
    rewardPoints,
    redeemBy
  );
  return res
    .status(200)
    .json({ reward, message: "Reward created successfully" });
};

export const getRewards = async (req: Request, res: Response): Promise<any> => {
  const rewards: Reward[] = (await repository.getRewards()) || [];
  if (!rewards || rewards.length === 0)
    return res.status(200).json({ message: "No rewards found", rewards: [] });
  return res.status(200).json({ rewards });
};

export const updateReward = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { rewardName, rewardDescription, rewardPoints, redeemBy } = req.body;

  if (!rewardName || !rewardDescription || !rewardPoints || !redeemBy) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const updated: boolean = await repository.updateReward(
    id,
    rewardName,
    rewardDescription,
    rewardPoints,
    redeemBy
  );

  if (!updated) return res.status(204);

  return res.status(200).json({ message: "Reward updated successfully" });
};

export const deleteReward = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  const deleted: boolean = await repository.deleteReward(id);

  if (!deleted) return res.status(204);

  return res.status(200).json({ message: "Reward deleted successfully" });
};

// Get user stats
export const getUserStats = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const stats = await repository.getUserStats(userId);
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting user stats:", error);
    return res.status(500).json({ message: "Failed to get user stats" });
  }
};

// Claim reward
export const claimReward = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, rewardId } = req.body;
    if (!userId || !rewardId) {
      return res
        .status(400)
        .json({ message: "User ID and Reward ID are required" });
    }

    const claimed = await repository.claimReward(userId, rewardId);

    if (!claimed) {
      return res
        .status(400)
        .json({ message: "Insufficient points to claim reward" });
    }

    return res.status(200).json({ message: "Reward claimed successfully" });
  } catch (error) {
    console.error("Error claiming reward:", error);
    return res.status(500).json({ message: "Failed to claim reward" });
  }
};
