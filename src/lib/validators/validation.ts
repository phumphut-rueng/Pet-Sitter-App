import { z } from "zod";

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

export const normalizeString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
};

export const pickDobYmd = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const raw = normalizeString(body["dob"]);
  if (!raw) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined;
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

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().regex(/^\d{9,15}$/).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  profileImage: z.string().url().optional(),                 // legacy
  profile_image_public_id: z.string().min(1).optional().or(z.literal(null)), // new
});

export type ValidationDetails = z.inferFlattenedErrors<typeof updateProfileSchema>;