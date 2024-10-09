import express, { Request, Response } from "express";
import { siginSchema, signupSchema } from "../auth/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

export default async function signupController(req: Request, res: Response) {
  const validate = signupSchema.safeParse(req.body);
  if (!validate.success) {
    res.status(400).json({
      msg: "Invalid Details",
    });
    return;
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
        username: user.username,
      },
      tokenSecret
    );

    res.status(201).json({
      msg: "User created successfully",
      token: "Bearer " + token,
    });
    return;
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        // Unique constraint violation
        res.status(400).json({
          msg: "User already exists with this email or username.",
        });
        return;
      }
    }

    console.error(err);
    res.status(500).json({
      msg: "User creation failed",
    });
    return;
  }
}

export async function signinController(req: Request, res: Response) {
  const validateSchema = siginSchema.safeParse(req.body);
  if (!validateSchema.success) {
    res.status(400).json({
      msg: "Invalid Details",
    });
    return;
  }
  const { usernameOrEmail, password } = validateSchema.data;
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      res.status(404).json({ msg: "User not found." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ msg: "Invalid password." });
      return;
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
        username: user.username,
      },
      tokenSecret
    );

    res.status(200).json({
      msg: "Sign-in successful",
      token: "Bearer " + token,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Sign-in failed",
    });
    return;
  }
}
