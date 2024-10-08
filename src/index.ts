import express from "express";
import routesRouter from "./routes";

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

app.use("/api/v1", routesRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on Port: http://localhost:3000`);
});
