import { z } from "zod";

const VALIDATION_RULES = {
  petTypeId: {
    min: 1,
  },
  ageMonth: {
    min: 0,
  },
  weight: {
    min: 0,
  },
} as const;

const ERROR_MESSAGES = {
  petType: "Select a pet type",
  name: "Name is required",
  breed: "Breed is required", 
  ageMonth: {
    integer: "Age (month) must be an integer",
    min: "Age (month) must be 0 or more",
  },
  color: "Color is required",
  weight: "Weight must be greater than 0",
} as const;


export const sexEnum = z.enum(["Male", "Female"]);

const validators = {
  petTypeId: z
    .number()
    .refine(
      (value) => Number.isInteger(value) && value > VALIDATION_RULES.petTypeId.min - 1,
      ERROR_MESSAGES.petType
    ),

  name: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.name),

  breed: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.breed),

  sex: sexEnum,

  ageMonth: z
    .number()
    .refine(
      (value) => Number.isInteger(value),
      ERROR_MESSAGES.ageMonth.integer
    )
    .min(VALIDATION_RULES.ageMonth.min, ERROR_MESSAGES.ageMonth.min),

  color: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.color),

  weightKg: z
    .number()
    .refine(
      (value) => value > VALIDATION_RULES.weight.min,
      ERROR_MESSAGES.weight
    ),

  about: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
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


export const petSchemas = {
  full: petSchema,

  required: z.object({
    petTypeId: validators.petTypeId,
    name: validators.name,
    breed: validators.breed,
    sex: validators.sex,
    ageMonth: validators.ageMonth,
    color: validators.color,
    weightKg: validators.weightKg,
  }),

  update: z.object({
    petTypeId: validators.petTypeId.optional(),
    name: validators.name.optional(),
    breed: validators.breed.optional(),
    sex: validators.sex.optional(),
    ageMonth: validators.ageMonth.optional(),
    color: validators.color.optional(),
    weightKg: validators.weightKg.optional(),
    about: validators.about,
    imageUrl: validators.imageUrl,
  }),

  public: z.object({
    name: validators.name,
    breed: validators.breed,
    sex: validators.sex,
    ageMonth: validators.ageMonth,
    color: validators.color,
    weightKg: validators.weightKg,
    about: validators.about,
    imageUrl: validators.imageUrl,
  }),
} as const;


export const petValidation = {
  validatePetTypeId: (id: number) => validators.petTypeId.safeParse(id),
  validateName: (name: string) => validators.name.safeParse(name),
  validateBreed: (breed: string) => validators.breed.safeParse(breed),
  validateSex: (sex: string) => validators.sex.safeParse(sex),
  validateAge: (age: number) => validators.ageMonth.safeParse(age),
  validateColor: (color: string) => validators.color.safeParse(color),
  validateWeight: (weight: number) => validators.weightKg.safeParse(weight),


  getFieldErrors: (result: ReturnType<typeof validators.name.safeParse>) => {
    if (result.success) return null;
    return result.error.issues.map((err: z.ZodIssue) => err.message);
  },

  isCompleteForCreation: (data: Partial<PetInput>): data is PetInput => {
    return petSchemas.required.safeParse(data).success;
  },
} as const;


export type Sex = z.infer<typeof sexEnum>;
export type PetUpdateInput = z.infer<typeof petSchemas.update>;
export type PetPublicView = z.infer<typeof petSchemas.public>;


export const petInputSchema = petSchema;