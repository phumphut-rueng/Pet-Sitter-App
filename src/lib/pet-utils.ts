import type { NextRouter } from "next/router";
import type { PetInput } from "@/lib/validators/pet";
import { Pet, PetFormValues, PetType } from "@/types/pet.types";


export type { Pet, PetFormValues, PetType };


export const ROUTES = {
  petList: "/account/pet",
  createPet: "/account/pet/create",
  editPet: (id: number) => `/account/pet/${id}`,
} as const;

export const ERROR_MESSAGES = {
  loadFailed: "Failed to load pet",
  updateFailed: "Update failed",
  deleteFailed: "Delete failed",
  createFailed: "Create failed",
  invalidPetType: "Please select a valid Pet Type",
  unknown: "Unknown error",
} as const;

export const SUCCESS_MESSAGES = {
  petCreated: "Pet created!",
  petUpdated: "Pet updated!",
  petDeleted: "Pet deleted!",
} as const;

export const NAVIGATION_DELAY = 900;


export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return ERROR_MESSAGES.unknown;
  }
};

export const parsePetId = (routerQuery: unknown): number | undefined => {
  const raw = Array.isArray(routerQuery) ? routerQuery[0] : routerQuery;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const validateImageUrl = (url?: string | null): string => {
  const trimmed = (url ?? "").trim();
  return trimmed && (trimmed.startsWith("http") || trimmed.startsWith("data:"))
    ? trimmed
    : "";
};


export const delayedNavigation = (
  router: Pick<NextRouter, "push">,
  path: string,
  delay: number = NAVIGATION_DELAY
) => {
  setTimeout(() => {
    void router.push(path);
  }, delay);
};


function toFormSex(value: unknown): PetFormValues["sex"] {
  return value === "Male" || value === "Female"
    ? (value as PetFormValues["sex"])
    : ("Male" as PetFormValues["sex"]); // เปลี่ยน default ได้ตามต้องการ
}

export const petResponseToFormValues = (pet: Pet): PetFormValues => ({
  name: pet.name ?? "",
  type: pet.petTypeName ?? "",
  breed: pet.breed ?? "",
  sex: toFormSex(pet.sex),
  ageMonth: String(pet.ageMonth ?? ""),
  color: pet.color ?? "",
  weightKg: String(pet.weightKg ?? ""),
  about: pet.about ?? "",
  image: validateImageUrl(pet.imageUrl),
});

export const formValuesToPayload = async (
  values: PetFormValues,
  getPetTypes: () => Promise<PetType[]>
): Promise<PetInput> => {
  const petTypes = await getPetTypes();
  const foundType = petTypes.find(
    (type) => type.name.toLowerCase() === values.type.toLowerCase()
  );

  if (!foundType) {
    throw new Error(ERROR_MESSAGES.invalidPetType);
  }

  return {
    petTypeId: foundType.id,
    name: values.name,
    breed: values.breed,
    sex: values.sex as "Male" | "Female",
    ageMonth: Number(values.ageMonth || 0),
    color: values.color,
    weightKg: Number(values.weightKg || 0),
    about: values.about || "",
    imageUrl: (values.image ?? "").trim(),
  };
};


export const petService = {
  fetchPet: async (id: number): Promise<Pet> => {
    const response = await fetch(`/api/pets/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.loadFailed);
    }

    return (await response.json()) as Pet;
  },

  updatePet: async (id: number, payload: PetInput): Promise<void> => {
    const response = await fetch(`/api/pets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage: string = ERROR_MESSAGES.updateFailed; 
      try {
        const errorData = (await response.json()) as unknown;
        errorMessage =
          (errorData as { error?: string; message?: string })?.error ||
          (errorData as { error?: string; message?: string })?.message ||
          errorMessage;
      } catch {
      }
      throw new Error(errorMessage);
    }
  },

  deletePet: async (id: number): Promise<void> => {
    const response = await fetch(`/api/pets/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage: string = ERROR_MESSAGES.deleteFailed; 
      try {
        const errorData = (await response.json()) as unknown;
        errorMessage =
          (errorData as { error?: string; message?: string })?.error ||
          (errorData as { error?: string; message?: string })?.message ||
          errorMessage;
      } catch {
      }
      throw new Error(errorMessage);
    }
  },

  createPet: async (payload: PetInput): Promise<void> => {
    const response = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage: string = ERROR_MESSAGES.createFailed; 
      try {
        const errorData = (await response.json()) as unknown;
        errorMessage =
          (errorData as { error?: string; message?: string })?.error ||
          (errorData as { error?: string; message?: string })?.message ||
          errorMessage;
      } catch {
      }
      throw new Error(errorMessage);
    }
  },
};