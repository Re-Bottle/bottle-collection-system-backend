import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  interface DecodedUser {
    id: string;
    username: string;
    // Add other properties as needed
  }

  jwt.verify(
    token,
    "your-secret-key",
    (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = decoded as DecodedUser; // Store the decoded user info in the request
      next();
    }
  );
};
