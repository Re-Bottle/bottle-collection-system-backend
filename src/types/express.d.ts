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

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
