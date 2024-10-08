"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = exports.siginSchema = void 0;
const zod_1 = require("zod");
const signupSchema = zod_1.z.object({
    name: zod_1.z.string(),
    username: zod_1.z.string().min(4, "Username must be at least 4 character"),
    email: zod_1.z.string().email("Invalid Email format"),
    password: zod_1.z.string().min(8, "Password must at least 8 character"),
});
exports.signupSchema = signupSchema;
const siginSchema = zod_1.z.object({
    usernameOrEmail: zod_1.z.string().min(1, "Username or Email is required"),
    password: zod_1.z.string().min(8, "Password must at least 8 character"),
});
exports.siginSchema = siginSchema;
