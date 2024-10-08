import { z } from "zod";

const signupSchema = z.object({
  name: z.string(),
  username: z.string().min(4, "Username must be at least 4 character"),
  email: z.string().email("Invalid Email format"),
  password: z.string().min(8, "Password must at least 8 character"),
});

const siginSchema = z.object({
  username: z.string().min(4, "Username must be at least 4 character"),
  email: z.string().email("Invalid Email format"),
  password: z.string().min(8, "Password must at least 8 character"),
});

export { siginSchema, signupSchema };
