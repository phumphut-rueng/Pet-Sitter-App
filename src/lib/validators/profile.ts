import { z } from "zod";

// ========================================
// Constants & Rules
// ========================================

export const VALIDATION_RULES = {
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
  dob: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
  },
} as const;

export const PROFILE_ERROR_MESSAGES = {
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
  dob: {
    format: "Date must be in YYYY-MM-DD format",
  },
} as const;

// ========================================
// Base Validators (Zod)
// ========================================

const validators = {
  name: z
    .string()
    .min(1, PROFILE_ERROR_MESSAGES.name.required)
    .min(VALIDATION_RULES.name.min, PROFILE_ERROR_MESSAGES.name.length)
    .max(VALIDATION_RULES.name.max, PROFILE_ERROR_MESSAGES.name.length),

  email: z
    .string()
    .min(1, PROFILE_ERROR_MESSAGES.email.required)
    .email(PROFILE_ERROR_MESSAGES.email.format),

  phone: z
    .string()
    .min(1, PROFILE_ERROR_MESSAGES.phone.required)
    .regex(VALIDATION_RULES.phone.pattern, PROFILE_ERROR_MESSAGES.phone.format),

  idNumber: z
    .string()
    .optional()
    .refine(
      (value) => !value || VALIDATION_RULES.idNumber.pattern.test(value),
      PROFILE_ERROR_MESSAGES.idNumber.format
    ),

  dob: z
    .string()
    .optional()
    .refine(
      (value) => !value || VALIDATION_RULES.dob.pattern.test(value),
      PROFILE_ERROR_MESSAGES.dob.format
    ),

  image: z.any().optional(),
} as const;

// ========================================
// Schemas
// ========================================

/**
 * Schema หลักสำหรับ Owner Profile Form
 */
export const ownerProfileSchema = z.object({
  image: validators.image,
  name: validators.name,
  email: validators.email,
  phone: validators.phone,
  idNumber: validators.idNumber,
  dob: validators.dob,
});

export type OwnerProfileInput = z.infer<typeof ownerProfileSchema>;

/**
 * Schema สำหรับ API Update (server-side)
 */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().regex(/^\d{9,15}$/).optional(),
  idNumber: z.string().regex(/^\d{13}$/).optional(), // 
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  profileImage: z.string().url().optional(),
  profile_image_public_id: z.string().min(1).optional().or(z.literal(null)),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Schema Variants (สำหรับใช้งานต่างๆ)
 */
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
  api: updateProfileSchema,
} as const;

// ========================================
// Helper Functions
// ========================================

/**
 * Validate แต่ละ field แบบ standalone
 */
export const profileValidation = {
  validateName: (name: string) => validators.name.safeParse(name),
  validateEmail: (email: string) => validators.email.safeParse(email),
  validatePhone: (phone: string) => validators.phone.safeParse(phone),
  validateIdNumber: (idNumber: string) => validators.idNumber.safeParse(idNumber),
  validateDob: (dob: string) => validators.dob.safeParse(dob),
} as const;

// ========================================
// Type Guards & Helpers
// ========================================

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => 
  typeof v === "object" && v !== null;

export const normalizeString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed ? trimmed : undefined;
};

export const pickDobYmd = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const raw = normalizeString(body["dob"]);
  if (!raw) return undefined;
  return VALIDATION_RULES.dob.pattern.test(raw) ? raw : undefined;
};

// ✅ เพิ่ม helper สำหรับ ID Number
export const pickIdNumber = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const candidate = body["idNumber"] ?? body["id_number"];
  const raw = normalizeString(candidate);
  if (!raw) return undefined;
  // Remove dashes and spaces
  const cleaned = raw.replace(/[\s-]/g, "");
  return VALIDATION_RULES.idNumber.pattern.test(cleaned) ? cleaned : undefined;
};

export const pickProfileImageUrl = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const candidate =
    body["profileImage"] ??
    body["profile_image"] ??
    body["profileImageUrl"] ??
    body["imageUrl"] ??
    body["image"];
  return normalizeString(candidate);
};

export const pickProfileImagePublicId = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const candidate =
    body["profile_image_public_id"] ??
    body["profileImagePublicId"] ??
    body["public_id"] ??
    body["publicId"];
  return normalizeString(candidate);
};

// ========================================
// Type Exports
// ========================================

export type ValidationDetails = z.inferFlattenedErrors<typeof updateProfileSchema>;
export type ProfileFormValues = OwnerProfileInput;