import express from "express";
import userRouter from "./users";
import doubtRouter from "./questions";

const routesRouter = express.Router();

routesRouter.use("/user", userRouter);
routesRouter.use("/doubt", doubtRouter);

export default routesRouter;
