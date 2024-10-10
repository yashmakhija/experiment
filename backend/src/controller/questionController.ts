import express, { Request, Response } from "express";
import { doubtSchema } from "../auth/auth";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
const prisma = new PrismaClient();

export async function postDoubt(req: Request, res: Response) {
  const username = req.params.username;

  const validateDoubt = doubtSchema.safeParse(req.body);

  if (!validateDoubt.success) {
    res.status(411).json({
      msg: "Please Enter Valid Doubt",
    });
    return;
  }

  const { title, description } = validateDoubt.data;
  const slugTitle = slugify(title, { lower: true, strict: true });
  console.log("Title:", slugTitle, "Username:", username);

  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    if (!user) {
      res.status(404).json({
        msg: `User with username '${username}' not found.`,
      });
      return;
    }
    const doubtSave = await prisma.question.create({
      data: {
        title: slugTitle,
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
    res.status(411).json({
      msg: "Doubt not publishded",
    });
    return;
  }
}

export async function showDoubt(req: Request, res: Response) {
  const allDoubt = await prisma.question.findMany({});
  res.json({
    allDoubt,
  });
}

export async function showUserDoubt(req: Request, res: Response) {
  const { username, title } = req.params;
  const slugTitle = slugify(title, { lower: true, strict: true });
  console.log("Title:", slugTitle, "Username:", username);

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      res.status(404).json({
        msg: `User with username '${username}' not found.`,
      });
      return;
    }
    const userDoubt = await prisma.question.findFirst({
      where: {
        userId: user.id,
        title: slugTitle,
      },
    });

    if (!userDoubt) {
      res.status(404).json({
        msg: `No doubt found for the given title '${title}' by user '${username}'`,
      });
      return;
    }

    res.status(200).json({
      userDoubt,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Error fetching doubt for the user",
    });
    return;
  }
}

export async function updateUserDoubt(req: Request, res: Response) {
  const { username, title } = req.params;
  const slugTitle = slugify(title, { lower: true, strict: true });
  console.log("Title:", slugTitle, "Username:", username);

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      res.status(404).json({
        msg: `User with username '${username}' not found.`,
      });
      return;
    }
    const response = doubtSchema.safeParse(req.body);

    const userDoubt = await prisma.question.updateMany({
      where: {
        userId: user.id,
        title: slugTitle,
      },
      data: {
        description: response.data?.description,
      },
    });

    if (userDoubt.count === 0) {
      res.status(404).json({
        msg: `No question found with the title '${title}' for user '${username}'`,
      });
      return;
    }

    res.status(200).json({
      msg: "Question updated successfully",
      updatedCount: userDoubt.count,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Error fetching doubt for the user",
    });
    return;
  }
}

export async function delteDoubt(req: Request, res: Response) {
  const { username, title } = req.params;
  const slugTitle = slugify(title, { lower: true, strict: true });
  console.log("Title:", slugTitle, "Username:", username);
  const authenticatedUserId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      res.status(404).json({
        msg: `User with username '${username}' not found.`,
      });
      return;
    }

    const doubt = await prisma.question.findFirst({
      where: {
        userId: user.id,
        title: slugTitle,
      },
    });

    if (!doubt) {
      res.status(404).json({
        msg: `No doubt found with the title '${title}' for user '${username}'`,
      });
      return;
    }

    if (authenticatedUserId !== doubt.userId) {
      res.status(403).json({
        msg: "You are not authorized to delete this doubt.",
      });
      return;
    }

    await prisma.question.delete({
      where: { id: doubt.id },
    });

    res.status(200).json({
      msg: "Deleted Successfully",
      doubtId: doubt.id,
      doubtTitle: doubt.title,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Error while deleting doubt for the user",
    });
    return;
  }
}
