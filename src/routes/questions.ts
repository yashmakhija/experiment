import express from "express";
import { doubtSchema } from "../auth/auth";
import { authenticationToken } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const doubtRouter = express.Router();

doubtRouter.post("/", authenticationToken, async (req: any, res: any) => {
  const validateDoubt = doubtSchema.safeParse(req.body);
  if (!validateDoubt.success) {
    res.status(400).json({
      msg: "Please Enter Valid Doubt",
    });
    return;
  }
  const { title, description } = validateDoubt.data;
  const userId = req.user.id;
  try {
    const doubtSave = await prisma.question.create({
      data: {
        title: title,
        description: description,
        userId: userId,
        isPublish: true,
      },
    });

    res.status(200).json({
      msg: "Your doubt has been published",
      doubtId: doubtSave.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(411).json({
      msg: "Doubt not publishded",
    });
  }
});

doubtRouter.get("/", async (req, res) => {
  const allDoubt = await prisma.question.findMany({});
  res.json({
    allDoubt,
  });
});

export default doubtRouter;
