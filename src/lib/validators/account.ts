import { z } from "zod";

export const ownerProfileSchema = z.object({
  image: z.any().optional(), 
  name: z
    .string()
    .min(1, "Your name is required")
    .min(6, "Name must be 6–20 characters")
    .max(20, "Name must be 6–20 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^0\d{9}$/, "Phone must start with 0 and be 10 digits"),
  idNumber: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{13}$/.test(v), "ID must be 13 digits"),
  dob: z.string().optional(),
});

export type OwnerProfileInput = z.infer<typeof ownerProfileSchema>;