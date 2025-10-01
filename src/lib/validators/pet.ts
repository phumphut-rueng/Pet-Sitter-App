import { z } from "zod";

const VALIDATION_RULES = {
  petTypeId: { min: 1 },
  ageMonth: { min: 0, max: 600 },
  weight: { min: 0, max: 200 },
} as const;

const ERROR_MESSAGES = {
  petType: "Select a pet type",
  name: "Name is required",
  breed: "Breed is required",
  ageMonth: {
    integer: "Age (month) must be an integer",
    min: "Age (month) must be 0 or more",
    max: `Age (month) must be ≤ ${VALIDATION_RULES.ageMonth.max}`,
  },
  color: "Color is required",
  weight: {
    min: "Weight must be greater than 0",
    max: `Weight must be ≤ ${VALIDATION_RULES.weight.max}`,
  },
  imageUrl: "Image URL must be http(s) or data URL",
} as const;

export const sexEnum = z.enum(["Male", "Female"]);
export type Sex = z.infer<typeof sexEnum>;

const validators = {
  petTypeId: z.number().refine(
    (v) => Number.isInteger(v) && v >= VALIDATION_RULES.petTypeId.min,
    ERROR_MESSAGES.petType
  ),
  name: z.string().trim().min(1, ERROR_MESSAGES.name),
  breed: z.string().trim().min(1, ERROR_MESSAGES.breed),
  sex: sexEnum,
  ageMonth: z
    .number()
    .refine((v) => Number.isInteger(v), ERROR_MESSAGES.ageMonth.integer)
    .min(VALIDATION_RULES.ageMonth.min, ERROR_MESSAGES.ageMonth.min)
    .max(VALIDATION_RULES.ageMonth.max, ERROR_MESSAGES.ageMonth.max),
  color: z.string().trim().min(1, ERROR_MESSAGES.color),
  weightKg: z
    .number()
    .refine((v) => v > VALIDATION_RULES.weight.min, ERROR_MESSAGES.weight.min)
    .max(VALIDATION_RULES.weight.max, ERROR_MESSAGES.weight.max),
  about: z.string().trim().optional().or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => {
      const s = v ?? "";
      return s === "" || /^https?:\/\//i.test(s) || /^data:image\//i.test(s);
    }, ERROR_MESSAGES.imageUrl),
} as const;

export const petSchema = z.object({
  petTypeId: validators.petTypeId,
  name: validators.name,
  breed: validators.breed,
  sex: validators.sex,
  ageMonth: validators.ageMonth,
  color: validators.color,
  weightKg: validators.weightKg,
  about: validators.about,
  imageUrl: validators.imageUrl,
});

export type PetInput = z.infer<typeof petSchema>;

const requiredSchema = z.object({
  petTypeId: validators.petTypeId,
  name: validators.name,
  breed: validators.breed,
  sex: validators.sex,
  ageMonth: validators.ageMonth,
  color: validators.color,
  weightKg: validators.weightKg,
});

const updateSchema = z.object({
  petTypeId: validators.petTypeId.optional(),
  name: validators.name.optional(),
  breed: validators.breed.optional(),
  sex: validators.sex.optional(),
  ageMonth: validators.ageMonth.optional(),
  color: validators.color.optional(),
  weightKg: validators.weightKg.optional(),
  about: validators.about.optional(),
  imageUrl: validators.imageUrl.optional(),
});

const publicSchema = z.object({
  name: validators.name,
  breed: validators.breed,
  sex: validators.sex,
  ageMonth: validators.ageMonth,
  color: validators.color,
  weightKg: validators.weightKg,
  about: validators.about,
  imageUrl: validators.imageUrl,
});

export const petSchemas = {
  full: petSchema,
  required: requiredSchema,
  update: updateSchema,
  public: publicSchema,
} as const;


const coerce = {
  petTypeId: z.coerce.number(),
  ageMonth: z.coerce.number(),
  weightKg: z.coerce.number(),
  sex: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .transform((s) => (s === "male" || s === "m" ? "Male" : s === "female" || s === "f" ? "Female" : s))
    .pipe(sexEnum),
};

export const petFormSchema = petSchema.extend({
  petTypeId: coerce.petTypeId.pipe(validators.petTypeId),
  ageMonth: coerce.ageMonth.pipe(validators.ageMonth),
  weightKg: coerce.weightKg.pipe(validators.weightKg),
  sex: coerce.sex,
});

export const petUpdateFormSchema = updateSchema.extend({
  petTypeId: coerce.petTypeId.pipe(validators.petTypeId).optional(),
  ageMonth: coerce.ageMonth.pipe(validators.ageMonth).optional(),
  weightKg: coerce.weightKg.pipe(validators.weightKg).optional(),
  sex: coerce.sex.optional(),
});


export type PetUpdateInput = z.infer<typeof updateSchema>;
export type PetPublicView = z.infer<typeof publicSchema>;
export const petInputSchema = petSchema;

type SimpleSafeParse<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError<unknown> };

export const petValidation = {
  validatePetTypeId: (id: number) => validators.petTypeId.safeParse(id),
  validateName: (name: string) => validators.name.safeParse(name),
  validateBreed: (breed: string) => validators.breed.safeParse(breed),
  validateSex: (sex: string) => validators.sex.safeParse(sex),
  validateAge: (age: number) => validators.ageMonth.safeParse(age),
  validateColor: (color: string) => validators.color.safeParse(color),
  validateWeight: (weight: number) => validators.weightKg.safeParse(weight),

  getFieldErrors: <T>(result: SimpleSafeParse<T>) => {
    if (result.success) return null;
    return result.error.issues.map((e: z.ZodIssue) => e.message);
  },

  isCompleteForCreation: (data: Partial<PetInput>): data is PetInput =>
    petSchemas.required.safeParse(data).success,
} as const;