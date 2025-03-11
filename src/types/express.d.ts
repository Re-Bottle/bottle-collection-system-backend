export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

export interface Device {
  deviceId: string;
  macAddress: string;
  vendorId: string | null;

  deviceName: string | null;
  deviceLocation: string | null;
  deviceFillLevel: number;
  deviceDescription: string | null;
  deviceActiveStatus: boolean;

  whenClaimed: Date | null;
  whenProvisioned: Date | null;

  lastActveTimestamp: Date;
}

export interface Reward {
  rewardId: string;
  rewardName: string;
  rewardDescription: string;
  rewardPoints: number;
  rewardActiveStatus: boolean;
  redeem_by: string | null;
}

export interface Scan {
  id: string;
  claimedBy: string;
  deviceId: string;
  scanData: string;
  timestamp: Date;
  bottleType: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
