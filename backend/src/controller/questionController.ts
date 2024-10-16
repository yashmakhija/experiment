import express, { Request, Response } from "express";
import { doubtSchema, updateDoubtSchema } from "../auth/auth";
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
        title: title,
        permaUrl: slugTitle,
        description: description,
        userId: userId,
        isPublish: true,
        upVote: 0,
        downVote: 0,
      },
    });

    res.status(200).json({
      msg: `Your doubt ${title} published`,
      doubtId: doubtSave.id,
      Url: doubtSave.permaUrl,
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
  console.log("permaUrl:", slugTitle, "Username:", username);

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
        permaUrl: slugTitle,
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
  console.log("permaUrl:", slugTitle, "Username:", username);
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
    const response = updateDoubtSchema.safeParse(req.body);

    if (!response.success) {
      res.status(400).json({
        msg: "Invalid data format",
      });
      return;
    }
    const doubt = await prisma.question.findFirst({
      where: {
        userId: user.id,
        permaUrl: slugTitle,
      },
    });
    if (!doubt) {
      res.status(404).json({
        msg: `No doubt found with the title $ for user '${username}'`,
      });
      return;
    }

    if (authenticatedUserId !== doubt.userId) {
      res.status(403).json({
        msg: "You are not authorized to update this doubt.",
      });
      return;
    }

    const draft = req.body.isPublish;

    const userDoubt = await prisma.question.updateMany({
      where: {
        id: doubt.id,
      },
      data: {
        description: response.data?.description,
        isPublish: draft,
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

export async function deleteDoubt(req: Request, res: Response) {
  const { username, title } = req.params;
  const slugTitle = slugify(title, { lower: true, strict: true });
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
        permaUrl: slugTitle,
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
  }
}

export async function showAllUserDoubt(req: Request, res: Response) {
  const username = req.params.username;

  try {
    const user = await prisma.user.findFirst({
      where: { username: username },
    });

    if (!user) {
      res.status(400).json({
        msg: "User doesnt exist",
      });
      return;
    }

    const userDoubt = await prisma.question.findMany({
      where: { userId: user.id },
    });

    if (userDoubt.length === 0) {
      res.status(404).json({
        msg: "This user hasn't posted any doubt yet",
      });
      return;
    }

    res.status(200).json({
      userDoubt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Error fetching doubt for the user",
    });
    return;
  }
}

export async function voteQuestion(req: Request, res: Response) {
  const { id } = req.params; // question ID
  const { voteType } = req.body; // "up" or "down"
  const userId = req.user.id; // Assuming the user is authenticated

  try {
    const findDoubt = await prisma.question.findUnique({
      where: { id: Number(id) },
    });

    if (!findDoubt) {
      res.status(404).json({ msg: "Question not found" });
      return;
    }

    // Use the nullish coalescing operator (??) to ensure the values are not null
    const currentUpVote = findDoubt.upVote ?? 0;
    const currentDownVote = findDoubt.downVote ?? 0;

    // Check if the user has already voted on this question
    const existingVote = await prisma.vote.findUnique({
      where: {
        questionId_userId: { questionId: Number(id), userId: userId },
      },
    });

    if (!existingVote) {
      // If no previous vote exists, create a new vote
      await prisma.vote.create({
        data: {
          voteType: voteType,
          questionId: Number(id),
          userId: userId,
        },
      });

      if (voteType === "up") {
        await prisma.question.update({
          where: { id: Number(id) },
          data: { upVote: currentUpVote + 1 },
        });
      } else if (voteType === "down") {
        await prisma.question.update({
          where: { id: Number(id) },
          data: { downVote: currentDownVote + 1 },
        });
      }

      res.status(200).json({ msg: "Vote registered successfully" });
    } else {
      // If a vote already exists, check if it's the same or different voteType
      if (existingVote.voteType === voteType) {
        res
          .status(400)
          .json({ msg: "You have already voted in this direction" });
        return;
      }

      // If the vote is different (e.g., up to down), update the vote and toggle the counters
      if (voteType === "up") {
        await prisma.question.update({
          where: { id: Number(id) },
          data: {
            upVote: currentUpVote + 1,
            downVote: currentDownVote - 1,
          },
        });
      } else if (voteType === "down") {
        await prisma.question.update({
          where: { id: Number(id) },
          data: {
            upVote: currentUpVote - 1,
            downVote: currentDownVote + 1,
          },
        });
      }

      // Update the voteType in the Vote table
      await prisma.vote.update({
        where: {
          questionId_userId: { questionId: Number(id), userId: userId },
        },
        data: {
          voteType: voteType,
        },
      });

      res.status(200).json({ msg: "Vote updated successfully" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "An error occurred while processing the vote" });
  }
}
