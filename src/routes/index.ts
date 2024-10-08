import express from "express";
import userRouter from "./users";

const routesRouter = express.Router();

routesRouter.use("/user", userRouter);

export default routesRouter;
