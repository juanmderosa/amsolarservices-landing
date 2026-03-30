import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "This field is required"
          : "This field must be a string of characters",
    })
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or less.")
    .trim(),
  company: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "This field is required"
          : "This field must be a string of characters",
    })
    .min(1, "Company is required.")
    .max(100, "Company must be 100 characters or less.")
    .trim(),
  email: z
    .email({
      error: (issue) =>
        issue.input === undefined
          ? "This field is required"
          : "Please enter a valid email address.",
    })
    .min(1, "Email is required.")
    .trim(),
  message: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "This field is required"
          : "This field must be a string of characters",
    })
    .min(1, "Message is required.")
    .max(2000, "Message must be 2000 characters or less.")
    .trim(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
