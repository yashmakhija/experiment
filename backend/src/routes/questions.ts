import express from "express";
import { authenticationToken } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

import {
  delteDoubt,
  postDoubt,
  showDoubt,
  showUserDoubt,
  updateUserDoubt,
} from "../controller/questionController";

const prisma = new PrismaClient();
const doubtRouter = express.Router();

//Specific user can post doubt
doubtRouter.post("/:username", authenticationToken, postDoubt);

//Show all doubt of all user
doubtRouter.get("/", showDoubt);

//show doubt by user:- username, title
doubtRouter.get("/:username/:title", showUserDoubt);

//show doubt by user
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

//update doubt by title user (Note: Can edit only description)
doubtRouter.patch("/:username/:title", authenticationToken, updateUserDoubt);

//delte doubt by user title
doubtRouter.delete("/:username/:title", authenticationToken, delteDoubt);

export default doubtRouter;
