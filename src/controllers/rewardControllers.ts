import { NextFunction, Request, Response } from "express";
import type { Reward } from "../types/express.d.ts";
import DynamoDB from "../repository/dynamoDB.js";
import RepositoryInterface from "../repository/repositoryInterface.js";

const repository: RepositoryInterface = DynamoDB.getInstance();

export const getRewards = async (req: Request, res: Response): Promise<any> => {
  const rewards = await repository.getRewards();
  if (!rewards)
    return res.status(200).json({ message: "No rewards found", rewards: [] });
  return res.status(200).json({ rewards });
};
