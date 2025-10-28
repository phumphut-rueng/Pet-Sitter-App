import type { NextRouter } from "next/router";
import type { PetInput } from "@/lib/validators/pet";
import { Pet, PetFormValues, PetType } from "@/types/pet.types";
import { uploadToCloudinary } from "@/lib/cloudinary/upload-to-cloudinary";
import { api } from "@/lib/api/axios";
import { isAxiosError } from "axios";
import { getErrorMessage as getErrorMsg } from "@/lib/utils/error";
import { PET_ERROR_MESSAGES } from "@/lib/constants/messages";
import { isDataUrl, dataUrlToFile } from "@/lib/cloudinary/image-helpers";

/** Re-exports */
export type { Pet, PetFormValues, PetType };
export { PET_ERROR_MESSAGES as ERROR_MESSAGES } from "@/lib/constants/messages";

/** Routes */
export const ROUTES = {
  petList: "/account/pet",
  createPet: "/account/pet/create",
  editPet: (id: number) => `/account/pet/${id}`,
} as const;

/** Navigation */
export const NAVIGATION_DELAY = 900;
export function delayedNavigation(
  router: Pick<NextRouter, "push">,
  path: string,
  delay: number = NAVIGATION_DELAY
) {
  const ms = Math.max(0, Number(delay) || 0);
  setTimeout(() => void router.push(path), ms);
}

/** Error helpers */
export function getErrorMessage(error: unknown): string {
  return getErrorMsg(error, PET_ERROR_MESSAGES.unknown);
}

/** Image & file */
export function validateImageUrl(url?: string | null): string {
  const trimmed = (url ?? "").trim();
  const ok =
    trimmed &&
    (trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("/"));
  return ok ? trimmed : "";
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  });
}

/** =========================
 *  Form Sanitizers
 *  ========================= */
export function sanitizeAgeInput(value: string): string {
  return value.replace(/\D+/g, "").slice(0, 3);
}

export function sanitizeWeightInput(value: string): string {
  // Remove commas and keep only digits and dots
  let cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  
  // Handle multiple dots - keep only the first one
  const dotCount = (cleaned.match(/\./g) || []).length;
  if (dotCount > 1) {
    const firstDotIndex = cleaned.indexOf('.');
    cleaned = cleaned.substring(0, firstDotIndex + 1) + 
              cleaned.substring(firstDotIndex + 1).replace(/\./g, '');
  }
  
  // Don't remove leading zeros for decimal numbers (e.g., 0.5)
  if (!cleaned.startsWith('0.') && cleaned.length > 1) {
    cleaned = cleaned.replace(/^0+/, '') || '0';
  }
  
  // Limit decimal places to 2
  if (cleaned.includes('.')) {
    const [integer, decimal] = cleaned.split('.');
    if (decimal && decimal.length > 2) {
      cleaned = integer + '.' + decimal.substring(0, 2);
    }
  }
  
  // Validate the number
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) {
    return cleaned; // Return the cleaned string even if invalid
  }
  
  // Clamp to maximum 100
  if (num > 100) {
    return '100';
  }
  
  return cleaned;
}

export function formatWeightForStorage(weight: string): string {
  // Remove trailing zeros and unnecessary decimal point for storage
  let formatted = weight.replace(/\.0+$/, '').replace(/\.$/, '');
  
  // Also remove trailing zeros after non-zero digits (e.g., 22.50 -> 22.5)
  if (formatted.includes('.')) {
    formatted = formatted.replace(/0+$/, '');
    if (formatted.endsWith('.')) {
      formatted = formatted.slice(0, -1);
    }
  }
  
  return formatted;
}

/** =========================
 *  Pet Type Resolution
 *  ========================= */
// include common Thai/EN variants
const PET_TYPE_ALIASES: Record<string, string[]> = {
  dog: ["dog", "dogs", "canine", "สุนัข", "หมา"],
  cat: ["cat", "cats", "feline", "แมว"],
  bird: ["bird", "birds", "นก"],
  rabbit: ["rabbit", "rabbits", "กระต่าย"],
};

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeName(text: string): string {
  return stripDiacritics(text)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[_\-]/g, "")
    .trim();
}

/** cache available type names → id for fast lookup within a single call */
function buildTypeIndex(types: PetType[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of types ?? []) {
    map.set(normalizeName(t.name), t.id);
  }
  return map;
}

function findPetTypeId(typeName: string, availableTypes: PetType[]): number | null {
  if (!availableTypes?.length || !typeName) return null;

  const idx = buildTypeIndex(availableTypes);
  const normalized = normalizeName(typeName);

  // exact
  if (idx.has(normalized)) return idx.get(normalized)!;

  // partial (either side contains the other)
  for (const [key, id] of idx) {
    if (key.includes(normalized) || normalized.includes(key)) return id;
  }

  // alias
  const aliasKey = Object.keys(PET_TYPE_ALIASES).find((key) =>
    PET_TYPE_ALIASES[key].some((v) => normalizeName(v) === normalized)
  );
  if (aliasKey) {
    const keyNorm = normalizeName(aliasKey);
    if (idx.has(keyNorm)) return idx.get(keyNorm)!;
    // try capitalized display names in DB
    const cap = aliasKey[0].toUpperCase() + aliasKey.slice(1);
    const capNorm = normalizeName(cap);
    if (idx.has(capNorm)) return idx.get(capNorm)!;
  }

  return null;
}

/** =========================
 *  Data Transformation
 *  ========================= */
type SexForm = PetFormValues["sex"]; // "" | "Male" | "Female"
type SexPayload = Extract<PetInput["sex"], "Male" | "Female">;

function toFormSex(value: unknown): SexForm {
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

const MAX_DATA_URL_BYTES = 6 * 1024 * 1024; // 6MB guard for uploads

function approxDataUrlBytes(dataUrl: string): number {
  // rough: length of base64 payload after "base64," → each char ~1 byte
  const i = dataUrl.indexOf("base64,");
  if (i === -1) return dataUrl.length;
  return dataUrl.length - (i + 7);
}

export async function formValuesToPayload(
  values: PetFormValues,
  getPetTypes: () => Promise<PetType[]>
): Promise<PetInput> {
  const types = await getPetTypes();
  const petTypeId = findPetTypeId(values.type, types);
  if (petTypeId == null) throw new Error(PET_ERROR_MESSAGES.invalidPetType);

  let imageUrl = (values.image ?? "").trim();

  if (isDataUrl(imageUrl)) {
    if (approxDataUrlBytes(imageUrl) > MAX_DATA_URL_BYTES) {
      throw new Error("Image is too large.");
    }
    const file = dataUrlToFile(imageUrl, "pet.png");
    imageUrl = await uploadToCloudinary(file, { folder: "pet-profile" });
  }

  const sex: SexPayload = values.sex === "Female" ? "Female" : "Male";

  const ageMonth = Number(values.ageMonth || 0);
  const weightKg = Number(formatWeightForStorage(values.weightKg || "0"));

  return {
    petTypeId,
    name: values.name.trim(),
    breed: values.breed.trim(),
    sex,
    ageMonth: Number.isFinite(ageMonth) ? ageMonth : 0,
    color: values.color.trim(),
    weightKg: Number.isFinite(weightKg) ? weightKg : 0,
    about: values.about?.trim() || "",
    imageUrl,
  };
}

/** =========================
 *  API Service
 *  ========================= */
function parseApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const data = payload as Record<string, unknown>;

  // Common shapes:
  // { message: string } | { error: string } | { errors: string[] | {msg:string}[] } | { detail: string }
  const msg = data.message;
  if (typeof msg === "string" && msg.trim()) return msg;

  const err = data.error;
  if (typeof err === "string" && err.trim()) return err;

  const detail = data.detail;
  if (typeof detail === "string" && detail.trim()) return detail;

  const errors = data.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    // map string[] or { msg }[]
    const first = errors.find((e: unknown) => typeof e === "string") as string | undefined;
    if (first && typeof first === "string" && first.trim()) return first;
    
    const msgItem = errors.find((e: unknown) => 
      typeof e === "object" && e !== null && "msg" in e && typeof (e as Record<string, unknown>).msg === "string"
    ) as { msg: string } | undefined;
    if (msgItem?.msg && typeof msgItem.msg === "string" && msgItem.msg.trim()) return msgItem.msg;
  }

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