import express from "express";
import userRoutes from "./routes/users";
import { authenticationToken } from "./middleware/authMiddleware";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  try {
    res.status(200).json({
      message: "You are at HomePage",
    });
  } catch (err) {
    res.status(411).json({
      msg: "Something went wrong",
    });
    console.log("error: ", err);
  }
});

app.use("/api/v1/user", userRoutes);

app.get("/protected", authenticationToken, (req, res) => {
  // Fixed syntax here
  res.json({ msg: "Hello from protected route" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on Port: http://localhost:3000`);
});
