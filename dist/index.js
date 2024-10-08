"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    try {
        res.status(200).json({
            message: "You are at HomePage",
        });
    }
    catch (err) {
        res.status(411).json({
            msg: "Something went wrong",
        });
        console.log("error: ", err);
    }
});
app.use("/api/v1/user", users_1.default);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on Port: http://localhost:3000`);
});
