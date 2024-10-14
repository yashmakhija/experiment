import express from "express";
import dotenv from "dotenv";
import {
  adminAccess,
  adminDelete,
  questionAnswered,
} from "../controller/adminController";
import { authenticationToken } from "../middleware/authMiddleware";

dotenv.config();
const adminRouter = express.Router();

adminRouter.get("/", authenticationToken, adminAccess);
adminRouter.delete("/delete", authenticationToken, adminDelete);
adminRouter.post("/answer", authenticationToken, questionAnswered);

export default adminRouter;
