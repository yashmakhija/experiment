import express, { Request, Response } from "express";
import { siginSchema, signupSchema } from "../auth/auth";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

dotenv.config();
const router = express.Router();
const prisma = new PrismaClient();

router.post("/signup", async (req: Request, res: Response) => {
  const validate = signupSchema.safeParse(req.body);
  if (!validate.success) {
    return res.status(400).json({
      msg: "Invalid Details",
    });
  }
  const { name, username, email, password } = validate.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    });
    const tokenSecret = process.env.SECRET;

    if (!tokenSecret) {
      throw new Error(
        "JWT secret is not defined. Please set the SECRET environment variable."
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      tokenSecret
    );

    return res.status(201).json({
      msg: "User created successfully",
      token: token,
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        // Unique constraint violation
        return res.status(400).json({
          msg: "User already exists with this email or username.",
        });
      }
    }

    console.error(err);
    return res.status(500).json({
      msg: "User creation failed",
    });
  }
});

export default router;
