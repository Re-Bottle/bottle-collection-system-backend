import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { User } from "../types/express";

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

  jwt.verify(
    token,
    process.env.SECRET_KEY ||
      "8e0f16e244aeb7b71fa3ab9299db3bc3e465d2b91962a5b4890c86b1da6c7fc1",
    (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err)
        return res.status(403).json({ message: "Invalid or expired token" });
      req.user = decoded as User; // Ensure decoded is typed as User
      next();
    }
  );
};

export const validateDevice = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const device = req.body;
  if (!device.deviceId || !device.macAddress) {
    res.status(400).json({ message: "Device ID and MAC Address are required" });
    return;
  }
  next();
};
