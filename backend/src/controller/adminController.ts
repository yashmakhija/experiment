import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function adminAccess(req: Request, res: Response) {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        msg: "User not found",
      });
      return;
    }

    if (user.isAdmin) {
      res.status(400).json({
        msg: "User is already an admin",
      });
      return;
    }

    const makeAdmin = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isAdmin: true,
      },
    });

    res.status(200).json({
      msg: "You are now an admin",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}

export async function adminDelete(req: Request, res: Response) {
  const userId = req.user.id;
  const questionId = req.body.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        msg: "User not found",
      });
      return;
    }

    if (!user.isAdmin) {
      res.status(400).json({
        msg: "User is not admin",
      });
      return;
    }
    const questionDelete = await prisma.question.delete({
      where: {
        id: questionId,
      },
    });

    res.status(200).json({
      msg: `Question deleted: ${questionDelete.id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({
      msg: "Question not found or you do not have permission to delete it",
    });
  }
}

export async function questionAnswered(req: Request, res: Response) {
  const userId = req.user.id;
  const questionId = req.body.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        msg: "User not found",
      });
      return;
    }

    if (!user.isAdmin) {
      res.status(400).json({
        msg: "User is not admin",
      });
      return;
    }
    const questionAnswered = await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        isAnswer: true,
      },
    });
    res.status(200).json({
      msg: `${user.name} Answered your Question:- ${questionAnswered.title}`,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(404).json({
      msg: "Question not found or you do not have permission to delete it",
    });
  }
}
