import express from "express";
import { authenticationToken } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

import {
  deleteDoubt,
  postDoubt,
  showAllUserDoubt,
  showDoubt,
  showUserDoubt,
  updateUserDoubt,
  voteQuestion,
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
doubtRouter.get("/:username", showAllUserDoubt);

//update doubt by title user (Note: Can edit only description)
doubtRouter.patch("/:username/:title", authenticationToken, updateUserDoubt);

//delte doubt by user title
doubtRouter.delete("/:username/:title", authenticationToken, deleteDoubt);

doubtRouter.patch("/:id", authenticationToken, voteQuestion);

export default doubtRouter;
