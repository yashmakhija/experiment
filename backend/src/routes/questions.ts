import express from "express";
import { doubtSchema } from "../auth/auth";
import { authenticationToken } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();
const doubtRouter = express.Router();

doubtRouter.post(
  "/:username",
  authenticationToken,
  async (req: any, res: any) => {
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
        return res.status(404).json({
          msg: `User with username '${username}' not found.`,
        });
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
      return res.status(411).json({
        msg: "Doubt not publishded",
      });
    }
  }
);

doubtRouter.get("/", async (req, res) => {
  const allDoubt = await prisma.question.findMany({});
  res.json({
    allDoubt,
  });
});

doubtRouter.get("/:username/:title", async (req: any, res: any) => {
  const { username, title } = req.params;
  const slugTitle = slugify(title, { lower: true, strict: true });
  console.log("Title:", slugTitle, "Username:", username);

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return res.status(404).json({
        msg: `User with username '${username}' not found.`,
      });
    }
    const userDoubt = await prisma.question.findFirst({
      where: {
        userId: user.id,
        title: slugTitle,
      },
    });

    if (!userDoubt) {
      return res.status(404).json({
        msg: `No doubt found for the given title '${title}' by user '${username}'`,
      });
    }

    return res.status(200).json({
      userDoubt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Error fetching doubt for the user",
    });
  }
});

doubtRouter.get("/:username", async (req: any, res: any) => {
  const username = req.params.username;

  try {
    const user = await prisma.user.findFirst({
      where: { username: username },
    });

    if (!user) {
      return res.status(400).json({
        msg: "User doesnt exist",
      });
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
    return res.status(500).json({
      msg: "Error fetching doubt for the user",
    });
  }
});

doubtRouter.patch("/:username/:title", async (req: any, res: any) => {
  const { username, title } = req.params;
  const slugTitle = slugify(title, { lower: true, strict: true });
  console.log("Title:", slugTitle, "Username:", username);

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return res.status(404).json({
        msg: `User with username '${username}' not found.`,
      });
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
      return res.status(404).json({
        msg: `No question found with the title '${title}' for user '${username}'`,
      });
    }

    return res.status(200).json({
      msg: "Question updated successfully",
      updatedCount: userDoubt.count,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Error fetching doubt for the user",
    });
  }
});

export default doubtRouter;
