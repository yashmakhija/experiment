"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../auth/auth");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const library_1 = require("@prisma/client/runtime/library");
dotenv_1.default.config();
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validate = auth_1.signupSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({
            msg: "Invalid Details",
        });
    }
    const { name, username, email, password } = validate.data;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword,
            },
        });
        const tokenSecret = process.env.SECRET;
        if (!tokenSecret) {
            throw new Error("JWT secret is not defined. Please set the SECRET environment variable.");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
        }, tokenSecret);
        return res.status(201).json({
            msg: "User created successfully",
            token: "Bearer " + token,
        });
    }
    catch (err) {
        if (err instanceof library_1.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                // Unique constraint violation
                return res.status(400).json({
                    msg: "User already exists with this email or username.",
                });
            }
        }
        console.error(err);
        return res.status(500).json({
            msg: "User creation failed",
        });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = auth_1.siginSchema.safeParse(req.body);
    if (!validateSchema.success) {
        return res.status(400).json({
            msg: "Invalid Details",
        });
    }
    const { usernameOrEmail, password } = validateSchema.data;
    try {
        const user = yield prisma.user.findFirst({
            where: {
                OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            },
        });
        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Invalid password." });
        }
        const tokenSecret = process.env.SECRET;
        if (!tokenSecret) {
            throw new Error("JWT secret is not defined. Please set the SECRET environment variable.");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
        }, tokenSecret);
        return res.status(200).json({
            msg: "Sign-in successful",
            token: "Bearer " + token,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            msg: "Sign-in failed",
        });
    }
}));
exports.default = router;
