import express from "express";
import dotenv from "dotenv";
import signupController, {
  signinController,
} from "../controller/userController";

dotenv.config();
const userRouter = express.Router();

userRouter.post("/signup", signupController);

userRouter.post("/signin", signinController);

export default userRouter;
