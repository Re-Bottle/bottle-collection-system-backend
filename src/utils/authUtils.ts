import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import type { User } from "../types/express.d.ts";

const SECRET_KEY =
  process.env.SECRET_KEY ||
  "8e0f16e244aeb7b71fa3ab9299db3bc3e465d2b91962a5b4890c86b1da6c7fc1";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.auth_token;
  if (!token) {
    console.log("No token provided");
    res.status(403).json({ message: "No token provided" });
    return;
  }

  validateToken(token, (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.user = decoded as User; // Ensure decoded is typed as User
    next();
  });
};

export const validateDevice = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const device = req.body;
  if (!device.id || !device.macAddress) {
    res.status(400).json({ message: "Device ID and MAC Address are required" });
    return;
  }
  next();
};

export const validateDeviceClaim = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const deviceClaimed = req.body;
  if (
    !deviceClaimed.id ||
    !deviceClaimed.vendorId ||
    !deviceClaimed.deviceName ||
    !deviceClaimed.deviceLocation
  ) {
    return res.status(400).json({ message: "Some parameters are missing" });
  }
  next();
};

export const createSignedToken = (user: User, email: string): string =>
  jwt.sign({ id: user.id, email }, SECRET_KEY, {
    expiresIn: "1h",
  });

export const createResetToken = (email: string): string =>
  jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });

export const validateToken = (
  token: string,
  callback: (err: jwt.VerifyErrors | null, decoded: any) => void
): any => {
  try {
    return jwt.verify(token, SECRET_KEY, callback);
  } catch (error) {
    return null;
  }
};
