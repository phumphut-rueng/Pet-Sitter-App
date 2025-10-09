import type { NextRouter } from "next/router";
import type { PetInput } from "@/lib/validators/pet";
import { Pet, PetFormValues, PetType } from "@/types/pet.types";
import { uploadToCloudinary } from "@/lib/cloudinary/upload-to-cloudinary";
import { api } from "@/lib/api/axios";
import { isAxiosError } from "axios";

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

/** 
 * แปลง axios error เป็น message string 
 * รองรับทั้ง { message } และ { error } 
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return (
      data?.message ||
      data?.error ||
      error.response?.statusText ||
      error.message ||
      ERROR_MESSAGES.unknown
    );
  }
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return ERROR_MESSAGES.unknown;
  }
};

/** แปลง router query เป็น pet ID */
export const parsePetId = (routerQuery: unknown): number | undefined => {
  const raw = Array.isArray(routerQuery) ? routerQuery[0] : routerQuery;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

/** ตรวจสอบว่า URL รูปภาพถูกต้องหรือไม่ */
export const validateImageUrl = (url?: string | null): string => {
  const trimmed = (url ?? "").trim();
  return trimmed &&
    (trimmed.startsWith("http") || trimmed.startsWith("data:") || trimmed.startsWith("/"))
    ? trimmed
    : "";
};

/** นำทางไปหน้าอื่นหลังจาก delay */
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
 * แปลง Pet response → form values
 * ========================= */
function toFormSex(value: unknown): PetFormValues["sex"] {
  return value === "Male" || value === "Female" ? value : "";
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
 * Pet type resolve (หา pet type ID จากชื่อ)
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
 *ไม่ใช้ fetch API แล้วใช้ atob แปลง base64 เป็น Blob แทน
 * ========================= */
const isDataUrl = (s?: string) => !!s && /^data:image\/[a-zA-Z]+;base64,/.test(s);

/** 
 * แปลง data URL → File โดยไม่ใช้ fetch API
 * ใช้ atob() แปลง base64 → binary → Blob → File แทน
 */
function dataUrlToFile(dataUrl: string, filename = "pet.png"): File {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("Invalid data URL");
  const mime = m[1] || "image/png";
  const b64 = m[2];

  // ใช้ atob แปลง base64 เป็น binary string (ไม่ใช้ fetch)
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  const blob = new Blob([bytes], { type: mime });
  return new File([blob], filename, { type: mime });
}

/* =========================
 * แปลง Form API payload
 * อัพโหลดรูปไปที่ Cloudinary folder "pet-profile"
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

  let imageUrl = (values.image ?? "").trim();

  // ถ้าเป็น data URL ให้แปลงเป็น File และอัพโหลด (ไม่ใช้ fetch)
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
};

/* =========================
 * API error parser
 * รองรับทั้ง { message: "..." } และ { error: "..." }
 * ========================= */
function parseApiErrorMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const rec = payload as Record<string, unknown>;
  const message = rec["message"];
  const error = rec["error"];
  if (typeof message === "string") return message;
  if (typeof error === "string") return error;
  return null;
}

/* =========================
 *  petService: ใช้ axios เรียก API ทั้งหมด
 * ชื่อฟังก์ชัน "fetchPet" เป็นแค่ชื่อ ไม่ได้ใช้ fetch API
 * จริงๆ ใช้ axios.get(), axios.put(), axios.post(), axios.delete()
 * ========================= */
export const petService = {
  /**
   * 📥 fetchPet: โหลดข้อมูล pet ด้วย axios.get()
   * หมายเหตุ: ชื่อ "fetch" เป็นแค่ชื่อฟังก์ชัน ไม่ได้ใช้ fetch API นะครับ!
   */
  async fetchPet(id: number): Promise<Pet> {
    try {
      // 🔹 ใช้ axios.get() ไม่ใช่ fetch
      const { data } = await api.get<Pet>(`pets/${id}`);
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err) || ERROR_MESSAGES.loadFailed);
    }
  },

  /** updatePet: อัพเดท pet ด้วย axios.put() */
  async updatePet(id: number, payload: PetInput): Promise<void> {
    try {
      // ใช้ axios.put() ไม่ใช่ fetch
      await api.put(`pets/${id}`, payload);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = parseApiErrorMessage(err.response?.data) || getErrorMessage(err);
        throw new Error(msg || ERROR_MESSAGES.updateFailed);
      }
      throw new Error(ERROR_MESSAGES.updateFailed);
    }
  },

  /** 🗑️ deletePet: ลบ pet ด้วย axios.delete() */
  async deletePet(id: number): Promise<void> {
    try {
      // ใช้ axios.delete() ไม่ใช่ fetch
      await api.delete(`pets/${id}`);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = parseApiErrorMessage(err.response?.data) || getErrorMessage(err);
        throw new Error(msg || ERROR_MESSAGES.deleteFailed);
      }
      throw new Error(ERROR_MESSAGES.deleteFailed);
    }
  },

  /**  createPet: สร้าง pet ใหม่ด้วย axios.post() */
  async createPet(payload: PetInput): Promise<void> {
    try {
      // 🔹 ใช้ axios.post() ไม่ใช่ fetch
      await api.post(`pets`, payload);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = parseApiErrorMessage(err.response?.data) || getErrorMessage(err);
        console.log(err)
        throw new Error(msg || ERROR_MESSAGES.createFailed);
      }
      throw new Error(ERROR_MESSAGES.createFailed);
    }
  },
};

/*
 Form Input Helpers
 */

/**
 * Sanitize age input - only digits, max 3 characters (0-999)
 */
export const sanitizeAgeInput = (value: string): string => {
  return value.replace(/\D+/g, "").slice(0, 3);
};

/**
 * Sanitize weight input - allow numbers and single decimal point
 */
/**
 * Sanitize weight input - allow numbers and single decimal point
 * Max weight: 100 kg
 */
export const sanitizeWeightInput = (value: string): string => {
  const cleaned = value
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "")
    .replace(/^(\d*\.\d*).*$/, "$1"); // เหลือจุดเดียว
  
  // แปลงเป็นตัวเลขเพื่อเช็คค่า
  const num = parseFloat(cleaned);
  
  // ถ้าเกิน 100 ให้คืนค่า "100"
  if (!isNaN(num) && num > 100) {
    return "100";
  }
  
  return cleaned;
};

/**
 * Convert File to base64 data URL (for form preview)
 */
export const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  });