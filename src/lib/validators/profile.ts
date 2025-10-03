import { z } from "zod";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

/* =========================
 * Messages
 * ========================= */
export const ERROR_MESSAGES = {
  loadFailed: "Failed to load profile",
  updateFailed: "Update failed",
  unknown: "Unknown error",
} as const;

export const SUCCESS_MESSAGES = {
  profileUpdated: "Profile updated!",
} as const;

/* =========================
 * Types
 * ========================= */
export type ProfileFormValues = {
  name: string;
  email: string;
  phone: string;
  idNumber?: string;
  dob?: string;          // 'YYYY-MM-DD' หรือว่าง
  profileImage?: string; // data URL / http(s) URL / ''
};

export const ProfileInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(100),
  phone: z.string().trim().max(20).optional().nullable().transform(v => v ?? undefined),
  idNumber: z.string().trim().max(50).optional().nullable().transform(v => v ?? undefined),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .transform(v => (v && v.trim() ? v : undefined)),
  profileImage: z.string().optional(),
});
export type ProfileInput = z.infer<typeof ProfileInputSchema>;

/* =========================
 * Helpers
 * ========================= */
const isHttpUrl = (s?: string) => !!s && /^https?:\/\//i.test(s);
const isDataUrl = (s?: string) => !!s && /^data:image\/[a-zA-Z]+;base64,/.test(s);

async function dataUrlToFile(dataUrl: string, filename = "profile.png"): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

export function getErrorMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  try { return JSON.stringify(e); } catch { return ERROR_MESSAGES.unknown; }
}

/* =========================
 * Mapper: Form -> Payload
 * ========================= */
export async function formValuesToProfilePayload(v: ProfileFormValues): Promise<ProfileInput> {
  let profileImage: string | undefined;
  const img = (v.profileImage ?? "").trim();

  if (isDataUrl(img)) {
    const file = await dataUrlToFile(img, "profile.png");
    // อัปโหลดไปโฟลเดอร์ owner-profile
    const url = await uploadToCloudinary(file, { folder: "owner-profile" });
    profileImage = url;
  } else if (isHttpUrl(img) || img.startsWith("/")) {
    profileImage = img;
  } else {
    profileImage = undefined;
  }

  const dto = {
    name: v.name.trim(),
    email: v.email.trim(),
    phone: v.phone?.trim() || undefined,
    idNumber: v.idNumber?.trim() || undefined,
    dob: v.dob?.trim() || undefined,
    ...(profileImage ? { profileImage } : {}),
  };

  return ProfileInputSchema.parse(dto);
}

/* =========================
 * Service
 * ========================= */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function parseApiErrorMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const rec = payload as Record<string, unknown>;
  const e = rec["error"];
  const m = rec["message"];
  if (typeof e === "string") return e;
  if (typeof m === "string") return m;
  return null;
}

export const profileService = {
  async fetchOwner(): Promise<ProfileFormValues> {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(ERROR_MESSAGES.loadFailed);
    const data = (await res.json()) as {
      name?: string; email: string; phone?: string;
      idNumber?: string | null; dob?: string | null; profileImage?: string | null;
    };
    return {
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      idNumber: data.idNumber ?? "",
      dob: data.dob ?? "",
      profileImage: data.profileImage ?? "",
    };
  },

  async updateOwner(payload: ProfileInput): Promise<void> {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let msg: string = ERROR_MESSAGES.updateFailed;
      try {
        const parsed: unknown = await res.json();
        const m = parseApiErrorMessage(parsed);
        if (m) msg = m;
      } catch { /* ignore */ }
      throw new Error(msg);
    }
  },
};