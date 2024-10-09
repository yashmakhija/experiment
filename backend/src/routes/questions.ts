import express from "express";
import { doubtSchema } from "../auth/auth";
import { authenticationToken } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { postDoubt, showDoubt, showUserDoubt, updateUserDoubt } from "../controller/questionController";

const prisma = new PrismaClient();
const doubtRouter = express.Router();

doubtRouter.post("/:username", authenticationToken, postDoubt);

doubtRouter.get("/", showDoubt);

doubtRouter.get("/:username/:title", showUserDoubt);

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

doubtRouter.patch("/:username/:title", authenticationToken, updateUserDoubt);

export default doubtRouter;
