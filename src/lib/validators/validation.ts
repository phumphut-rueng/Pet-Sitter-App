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

import { errorType, FieldValidation } from "@/types/field-validation";
import { UserRole } from "@/types/register.types";
import axios from "axios";

const result = (
  message = "",
  error?: errorType,
  data?: object
): FieldValidation => ({
  message,
  ...(error && { error }),
  ...(data && { data }),
});

//ที่ใช้ post เพราะว่า ไม่อยากให้ใน network เห็นข้อมูลที่ส่งไป
async function fetchData<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const { data } = await axios.post<T>(url, body);
    return data;
  } catch (e) {
    console.error(`${url} request failed:`, e);
    return null;
  }
}

export const validateEmail = async (
  value: string,
  role_ids?: number,
  checkConflict = false,
): Promise<FieldValidation> => {
  if (!value.trim())
    return result("Please input your Email");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value))
    return result("Invalid email format");

  if (checkConflict) {
    await checkEmailConflict(value, role_ids)
  }

  return { message: "" };
}

const checkEmailConflict = async (
  value: string,
  role_ids?: number
) => {
  try {
    const data = await fetchData<{
      exists: boolean;
      data: { user_role: UserRole[] }
    }>(
      "/api/user/get-role",
      { email: value }
    );

    if (data?.exists && role_ids) {
      const hasRole = data.data.user_role.some((ur: UserRole) => ur.role_id === role_ids)
      const msg = "This email is already registered";
      return hasRole
        ? result(msg, "Conflict", data)
        : result(msg, undefined, data);
    }
  } catch (e) {
    console.error("Email check failed:", e);
  }
}

export const validatePhone = async (
  value: string
): Promise<FieldValidation> => {
  if (!value.trim())
    return result("Please input your Phone");

  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(value))
    return result("Phone must start with 0 and be 10 digits");

  try {
    const data = await fetchData<{ exists: boolean }>(
      `/api/user/check-phone`,
      { phone: value });

    if (data?.exists)
      return result("This phone number is already registered");
  } catch (e) {
    console.error("Phone check failed:", e);
  }

  return { message: "" };
}

export async function validatePassword(
  value: string
): Promise<FieldValidation> {
  if (!value.trim())
    return result("Please input your Password");

  if (value.length < 8)
    return result("Password must be more than 8 characters");

  return result();
}