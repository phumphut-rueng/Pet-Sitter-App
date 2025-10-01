import type { NextRouter } from "next/router";
import type { PetInput } from "@/lib/validators/pet";
import { Pet, PetFormValues, PetType } from "@/types/pet.types";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

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
  return trimmed &&
    (trimmed.startsWith("http") || trimmed.startsWith("data:") || trimmed.startsWith("/"))
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

/* =========================
 * Pet response -> form values
 * ========================= */
function toFormSex(value: unknown): PetFormValues["sex"] {
  return value === "Male" || value === "Female"
    ? (value as PetFormValues["sex"])
    : "";
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

/* =========================
 * Pet type resolve
 * ========================= */
const norm = (s: string) =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[_\-]/g, "")
    .trim();

const PET_TYPE_ALIASES: Record<string, string[]> = {
  dog: ["dog", "dogs", "canine", "สุนัข", "หมา"],
  cat: ["cat", "cats", "feline", "แมว"],
  bird: ["bird", "birds", "นก"],
  rabbit: ["rabbit", "rabbits", "กระต่าย"],
  // ถ้าโปรเจ็กต์มี type "Other" ให้เพิ่ม:
  // other: ["other", "อื่นๆ", "etc"],
};

function resolvePetTypeId(input: string, types: PetType[]): number | null {
  if (!types?.length) return null;
  const k = norm(input);
  if (!k) return null;

  const exact = types.find((t) => norm(t.name) === k);
  if (exact) return exact.id;

  const loose = types.find((t) => {
    const tn = norm(t.name);
    return tn.includes(k) || k.includes(tn);
  });
  if (loose) return loose.id;

  const aliasKey = Object.keys(PET_TYPE_ALIASES).find((key) =>
    PET_TYPE_ALIASES[key].includes(k)
  );
  if (aliasKey) {
    const byKey = types.find((t) => norm(t.name) === norm(aliasKey));
    if (byKey) return byKey.id;
    const cap = aliasKey[0].toUpperCase() + aliasKey.slice(1);
    const byCap = types.find((t) => norm(t.name) === norm(cap));
    if (byCap) return byCap.id;
  }


  return null;
}

/* =========================
 * Image helpers (upload to Cloudinary)
 * ========================= */
const isDataUrl = (s?: string) => !!s && /^data:image\/[a-zA-Z]+;base64,/.test(s);

async function dataUrlToFile(dataUrl: string, filename = "pet.png"): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

/* =========================
 * Form -> API payload
 * (Upload image to folder "pet_profile" if needed)
 * ========================= */
export const formValuesToPayload = async (
  values: PetFormValues,
  getPetTypes: () => Promise<PetType[]>
): Promise<PetInput> => {
  const types = await getPetTypes();
  const petTypeId = resolvePetTypeId(values.type, types);

  if (petTypeId == null) {
    throw new Error(ERROR_MESSAGES.invalidPetType);
  }

  // รูปจากฟอร์ม (อาจเป็น data URL / URL / path)
  let imageUrl = (values.image ?? "").trim();

  // ถ้าเป็น data URL ให้อัปขึ้น Cloudinary โฟลเดอร์ pet-profile
  if (isDataUrl(imageUrl)) {
    const file = await dataUrlToFile(imageUrl, "pet.png");
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
    imageUrl, // ใช้คีย์เดิมของโปรเจ็กต์คุณ
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/* =========================
 * API error parse
 * ========================= */
function parseApiErrorMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const rec = payload as Record<string, unknown>;
  const e = rec["error"];
  const m = rec["message"];
  if (typeof e === "string") return e;
  if (typeof m === "string") return m;
  return null;
}

/* =========================
 * petService
 * ========================= */
export const petService = {
  async fetchPet(id: number): Promise<Pet> {
    const res = await fetch(`${API_BASE}/api/pets/${id}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(ERROR_MESSAGES.loadFailed);
    return (await res.json()) as Pet;
  },

  async updatePet(id: number, payload: PetInput): Promise<void> {
    const res = await fetch(`${API_BASE}/api/pets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let errorMessage: string = ERROR_MESSAGES.updateFailed;
      try {
        const parsed: unknown = await res.json();
        const msg = parseApiErrorMessage(parsed);
        if (msg) errorMessage = msg;
      } catch { /* ignore parse error */ }
      throw new Error(errorMessage);
    }
  },

  async deletePet(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/pets/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      let errorMessage: string = ERROR_MESSAGES.deleteFailed;
      try {
        const parsed: unknown = await res.json();
        const msg = parseApiErrorMessage(parsed);
        if (msg) errorMessage = msg;
      } catch { /* ignore parse error */ }
      throw new Error(errorMessage);
    }
  },

  async createPet(payload: PetInput): Promise<void> {
    const res = await fetch(`${API_BASE}/api/pets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let errorMessage: string = ERROR_MESSAGES.createFailed;
      try {
        const parsed: unknown = await res.json();
        const msg = parseApiErrorMessage(parsed);
        if (msg) errorMessage = msg;
      } catch { /* ignore parse error */ }
      throw new Error(errorMessage);
    }
  },
};