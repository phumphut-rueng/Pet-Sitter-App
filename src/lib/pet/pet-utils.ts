import type { NextRouter } from "next/router";
import type { PetInput } from "@/lib/validators/pet";
import { Pet, PetFormValues, PetType } from "@/types/pet.types";
import { uploadToCloudinary } from "@/lib/cloudinary/upload-to-cloudinary";
import { api } from "@/lib/api/axios";
import { isAxiosError } from "axios";
import { PET_ERROR_MESSAGES, PET_SUCCESS_MESSAGES } from "@/lib/constants/messages";

export type { Pet, PetFormValues, PetType };


export const ROUTES = {
  petList: "/account/pet",
  createPet: "/account/pet/create",
  editPet: (id: number) => `/account/pet/${id}`,
} as const;

export const NAVIGATION_DELAY = 900;

// Re-export messages for convenience
export { PET_ERROR_MESSAGES as ERROR_MESSAGES, PET_SUCCESS_MESSAGES as SUCCESS_MESSAGES };



export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return (
      data?.message ||
      data?.error ||
      error.response?.statusText ||
      error.message ||
      PET_ERROR_MESSAGES.unknown
    );
  }

  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return PET_ERROR_MESSAGES.unknown;
  }
}



export function parsePetId(routerQuery: unknown): number | undefined {
  const raw = Array.isArray(routerQuery) ? routerQuery[0] : routerQuery;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function delayedNavigation(
  router: Pick<NextRouter, "push">,
  path: string,
  delay: number = NAVIGATION_DELAY
) {
  setTimeout(() => {
    void router.push(path);
  }, delay);
}


export function validateImageUrl(url?: string | null): string {
  const trimmed = (url ?? "").trim();
  const isValid =
    trimmed &&
    (trimmed.startsWith("http") || trimmed.startsWith("data:") || trimmed.startsWith("/"));
  return isValid ? trimmed : "";
}

function isDataUrl(url?: string): boolean {
  return !!url && /^data:image\/[a-zA-Z]+;base64,/.test(url);
}

function dataUrlToFile(dataUrl: string, filename = "pet.png"): File {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");

  const [, mime = "image/png", base64] = match;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mime });
  return new File([blob], filename, { type: mime });
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  });
}

// ==========================================
// Form Input Sanitizers
// ==========================================

export function sanitizeAgeInput(value: string): string {
  return value.replace(/\D+/g, "").slice(0, 3);
}

export function sanitizeWeightInput(value: string): string {
  const cleaned = value
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "")
    .replace(/^(\d*\.\d*).*$/, "$1");

  const num = parseFloat(cleaned);
  if (!isNaN(num) && num > 100) {
    return "100";
  }

  return cleaned;
}

// ==========================================
// Pet Type Resolution
// ==========================================

const PET_TYPE_ALIASES: Record<string, string[]> = {
  dog: ["dog", "dogs", "canine", "สุนัข", "หมา"],
  cat: ["cat", "cats", "feline", "แมว"],
  bird: ["bird", "birds", "นก"],
  rabbit: ["rabbit", "rabbits", "กระต่าย"],
};

function normalizeName(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[_\-]/g, "")
    .trim();
}

function findPetTypeId(typeName: string, availableTypes: PetType[]): number | null {
  if (!availableTypes?.length || !typeName) return null;

  const normalized = normalizeName(typeName);

  // ลองหา exact match ก่อน
  const exactMatch = availableTypes.find((t) => normalizeName(t.name) === normalized);
  if (exactMatch) return exactMatch.id;

  // ลองหา partial match
  const partialMatch = availableTypes.find((t) => {
    const tn = normalizeName(t.name);
    return tn.includes(normalized) || normalized.includes(tn);
  });
  if (partialMatch) return partialMatch.id;

  // ลองหาจาก aliases
  const aliasKey = Object.keys(PET_TYPE_ALIASES).find((key) =>
    PET_TYPE_ALIASES[key].includes(normalized)
  );

  if (aliasKey) {
    const byAlias = availableTypes.find((t) => normalizeName(t.name) === normalizeName(aliasKey));
    if (byAlias) return byAlias.id;

    const capitalized = aliasKey[0].toUpperCase() + aliasKey.slice(1);
    const byCapitalized = availableTypes.find((t) => normalizeName(t.name) === normalizeName(capitalized));
    if (byCapitalized) return byCapitalized.id;
  }

  return null;
}

// ==========================================
// Data Transformation
// ==========================================

function toFormSex(value: unknown): PetFormValues["sex"] {
  return value === "Male" || value === "Female" ? value : "";
}

export function petResponseToFormValues(pet: Pet): PetFormValues {
  return {
    name: pet.name ?? "",
    type: pet.petTypeName ?? "",
    breed: pet.breed ?? "",
    sex: toFormSex(pet.sex),
    ageMonth: String(pet.ageMonth ?? ""),
    color: pet.color ?? "",
    weightKg: String(pet.weightKg ?? ""),
    about: pet.about ?? "",
    image: validateImageUrl(pet.imageUrl),
  };
}

export async function formValuesToPayload(
  values: PetFormValues,
  getPetTypes: () => Promise<PetType[]>
): Promise<PetInput> {
  const types = await getPetTypes();
  const petTypeId = findPetTypeId(values.type, types);

  if (petTypeId == null) {
    throw new Error(PET_ERROR_MESSAGES.invalidPetType);
  }

  let imageUrl = (values.image ?? "").trim();

  if (isDataUrl(imageUrl)) {
    const file = dataUrlToFile(imageUrl, "pet.png");
    imageUrl = await uploadToCloudinary(file, { folder: "pet-profile" });
  }

  return {
    petTypeId,
    name: values.name.trim(),
    breed: values.breed.trim(),
    sex: values.sex === "Female" ? "Female" : "Male",
    ageMonth: Number(values.ageMonth || 0),
    color: values.color.trim(),
    weightKg: Number(values.weightKg || 0),
    about: values.about?.trim() || "",
    imageUrl,
  };
}

// ==========================================
// API Service
// ==========================================

function parseApiErrorMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;

  const data = payload as Record<string, unknown>;
  const message = data.message;
  const error = data.error;

  if (typeof message === "string") return message;
  if (typeof error === "string") return error;

  return null;
}

export const petService = {
  async fetchPet(id: number): Promise<Pet> {
    try {
      const { data } = await api.get<Pet>(`pets/${id}`);
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err) || PET_ERROR_MESSAGES.loadFailed);
    }
  },

  async createPet(payload: PetInput): Promise<void> {
    try {
      await api.post(`pets`, payload);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = parseApiErrorMessage(err.response?.data) || getErrorMessage(err);
        throw new Error(msg || PET_ERROR_MESSAGES.createFailed);
      }
      throw new Error(PET_ERROR_MESSAGES.createFailed);
    }
  },

  async updatePet(id: number, payload: PetInput): Promise<void> {
    try {
      await api.put(`pets/${id}`, payload);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = parseApiErrorMessage(err.response?.data) || getErrorMessage(err);
        throw new Error(msg || PET_ERROR_MESSAGES.updateFailed);
      }
      throw new Error(PET_ERROR_MESSAGES.updateFailed);
    }
  },

  async deletePet(id: number): Promise<void> {
    try {
      await api.delete(`pets/${id}`);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = parseApiErrorMessage(err.response?.data) || getErrorMessage(err);
        throw new Error(msg || PET_ERROR_MESSAGES.deleteFailed);
      }
      throw new Error(PET_ERROR_MESSAGES.deleteFailed);
    }
  },
};