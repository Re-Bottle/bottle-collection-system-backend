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
