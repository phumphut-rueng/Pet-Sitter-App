import { z } from "zod";


const VALIDATION_RULES = {
  name: {
    min: 6,
    max: 20,
  },
  phone: {
    length: 10,
    pattern: /^0\d{9}$/,
  },
  idNumber: {
    length: 13,
    pattern: /^\d{13}$/,
  },
} as const;

const ERROR_MESSAGES = {
  name: {
    required: "Your name is required",
    length: `Name must be ${VALIDATION_RULES.name.min}–${VALIDATION_RULES.name.max} characters`,
  },
  email: {
    required: "Email is required",
    format: "Invalid email format",
  },
  phone: {
    required: "Phone is required",
    format: "Phone must start with 0 and be 10 digits",
  },
  idNumber: {
    format: "ID must be 13 digits",
  },
} as const;


const validators = {
  name: z
    .string()
    .min(1, ERROR_MESSAGES.name.required)
    .min(VALIDATION_RULES.name.min, ERROR_MESSAGES.name.length)
    .max(VALIDATION_RULES.name.max, ERROR_MESSAGES.name.length),

  email: z
    .string()
    .min(1, ERROR_MESSAGES.email.required)
    .email(ERROR_MESSAGES.email.format),

  phone: z
    .string()
    .min(1, ERROR_MESSAGES.phone.required)
    .regex(VALIDATION_RULES.phone.pattern, ERROR_MESSAGES.phone.format),

  idNumber: z
    .string()
    .optional()
    .refine(
      (value) => !value || VALIDATION_RULES.idNumber.pattern.test(value),
      ERROR_MESSAGES.idNumber.format
    ),

  dob: z.string().optional(),

  image: z.any().optional(),
} as const;


export const ownerProfileSchema = z.object({
  image: validators.image,
  name: validators.name,
  email: validators.email,
  phone: validators.phone,
  idNumber: validators.idNumber,
  dob: validators.dob,
});

export type OwnerProfileInput = z.infer<typeof ownerProfileSchema>;


export const profileSchemas = {

  full: ownerProfileSchema,

  required: z.object({
    name: validators.name,
    email: validators.email,
    phone: validators.phone,
  }),

  public: z.object({
    name: validators.name,
    image: validators.image,
  }),

  update: z.object({
    name: validators.name.optional(),
    email: validators.email.optional(),
    phone: validators.phone.optional(),
    idNumber: validators.idNumber,
    dob: validators.dob,
    image: validators.image,
  }),
} as const;


export const profileValidation = {
  validateName: (name: string) => validators.name.safeParse(name),
  validateEmail: (email: string) => validators.email.safeParse(email),
  validatePhone: (phone: string) => validators.phone.safeParse(phone),
  validateIdNumber: (idNumber: string) => validators.idNumber.safeParse(idNumber),
  
  
  getFieldErrors: (result: ReturnType<typeof validators.name.safeParse>) => {
    if (result.success) return null;
    return result.error.issues.map((err: z.ZodIssue) => err.message);
  },
} as const;