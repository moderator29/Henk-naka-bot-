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

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "At least 3 characters")
  .max(20, "At most 20 characters")
  .regex(/^[a-z0-9_]+$/, "Letters, numbers, and underscores only");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(50, "Too long");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    username: usernameSchema,
    displayName: z.string().trim().max(50, "Too long").optional().or(z.literal("")),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    dateOfBirth: dobSchema,
    ageConfirmed: z.literal(true, {
      message: "You must confirm you are 18 or older",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const emailOnlySchema = z.object({ email: emailSchema });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
