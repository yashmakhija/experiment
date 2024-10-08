import express from "express";
import { siginSchema, signupSchema } from "../auth/auth";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

dotenv.config();
const router = express.Router();
const prisma = new PrismaClient();

router.post("/signup", async (req: any, res: any) => {
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
      token: "Bearer " + token,
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

router.post("/signin", async (req: any, res: any) => {
  const validateSchema = siginSchema.safeParse(req.body);
  if (!validateSchema.success) {
    return res.status(400).json({
      msg: "Invalid Details",
    });
  }
  const { usernameOrEmail, password } = validateSchema.data;
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid password." });
    }

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

    return res.status(200).json({
      msg: "Sign-in successful",
      token: "Bearer " + token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Sign-in failed",
    });
  }
});

export default router;
