import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import signupController, {
  signinController,
} from "../controller/userController";

dotenv.config();
const userRouter = express.Router();
const prisma = new PrismaClient();

userRouter.post("/signup", signupController);

userRouter.post("/signin", signinController);

export default userRouter;
