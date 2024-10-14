import express from "express";
import userRouter from "./users";
import doubtRouter from "./questions";
import adminRouter from "./admin";

const routesRouter = express.Router();

routesRouter.use("/user", userRouter);
routesRouter.use("/doubt", doubtRouter);
routesRouter.use("/admin", adminRouter);

export default routesRouter;
