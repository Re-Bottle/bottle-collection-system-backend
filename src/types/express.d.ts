export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

export interface Device {
  deviceId: string;
  deviceName: string | null;
  vendorId: string | null;
  deviceLocation: string | null;
  deviceFillLevel: number;
  deviceDescription: string | null;
  claimableStatus: boolean;
  lastActionTimestamp: Date;
  deviceActiveStatus: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
