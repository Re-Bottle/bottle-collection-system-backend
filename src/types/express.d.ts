export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  totalPoints: number;
  totalBottles: number;
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
  id: string;
  rewardName: string;
  rewardDescription: string;
  rewardPoints: number;
  rewardActiveStatus: boolean;
  redeemBy: string | null;
}

export interface Scan {
  id: string;
  claimedBy: string;
  deviceId: string;
  scanData: string;
  timestamp: Date;
  bottleType: number;
}

export interface OTP {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface Claim {
  id: string;
  userId: string;
  rewardId: string;
  rewardPoints: number;
  claimedAt: string;
  status: "claimed" | "used";
}

export interface ScanClaimResponse {
  scan: Scan;
  user: {
    totalPoints: number;
    totalBottles: number;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
