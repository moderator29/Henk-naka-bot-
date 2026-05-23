import { z } from "zod";
import { isAdult, parseDateOfBirth } from "./age";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(72, "Too long")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

const dobSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine((v) => parseDateOfBirth(v) !== null, "Enter a valid date")
  .refine((v) => {
    const dob = parseDateOfBirth(v);
    return dob !== null && isAdult(dob);
  }, "You must be 18 or older to use Pleasure Coin");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  dateOfBirth: dobSchema,
  ageConfirmed: z.literal(true, {
    message: "You must confirm you are 18 or older",
  }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
