import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const authenticationToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Promise<void> => {
  // Explicitly set return type
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      msg: "You are not logged in",
    });
    return;
  }

  jwt.verify(token, process.env.SECRET as string, (err, user) => {
    if (err) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    req.user = user; // Save the user data to the request object
    next(); // Call the next middleware or route handler
  });
};
