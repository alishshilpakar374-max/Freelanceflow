import { z } from "zod";

// Same pattern as leadSchema. I've duplicated it for now, and we'll tidy that up later.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .regex(EMAIL_PATTERN, "Enter a valid email address");

export const loginSchema = z.object({
  email,
  // No strength rules at login. We only check the password isn't empty.
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Your name is required")
      .max(120, "Keep it under 120 characters"),
    email,
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      // Supabase hashes with bcrypt, which only uses the first 72 bytes.
      .max(72, "Use 72 characters or fewer"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({ email });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const newPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use 72 characters or fewer");

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "Choose a password different from your current one",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
