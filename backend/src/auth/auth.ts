import { boolean, z } from "zod";

const signupSchema = z.object({
  name: z.string(),
  username: z.string().min(4, "Username must be at least 4 character"),
  email: z.string().email("Invalid Email format"),
  password: z.string().min(8, "Password must at least 8 character"),
});

const siginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or Email is required"),
  password: z.string().min(8, "Password must at least 8 character"),
});

const doubtSchema = z.object({
  title: z.string().min(4, "Add atleast 4 character in title"),
  description: z.string().min(5, "Add atleast more than 5 words description"),
});

const updateDoubtSchema = z.object({
  description: z.string().min(5, "Add atleast more than 5 words description"),
});

const adminSchema = z.object({
  name: z.string(),
  username: z.string().min(4, "Username must be at least 4 character"),
  email: z.string().email("Invalid Email format"),
  password: z.string().min(8, "Password must at least 8 character"),
  isAdmin: z.boolean(),
});

export {
  siginSchema,
  signupSchema,
  doubtSchema,
  adminSchema,
  updateDoubtSchema,
};
