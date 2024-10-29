import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "UserName must be 2 character")
  .max(20);

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});
