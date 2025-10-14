import { z } from "zod";
import { errorType, FieldValidation } from "@/types/field-validation";
import { UserRole } from "@/types/register.types";
import axios from "axios";

/* --------------------------------------------------------
 * helpers
 * ------------------------------------------------------ */
const result = (
  message = "",
  error?: errorType,
  data?: object
): FieldValidation => ({
  message,
  ...(error && { error }),
  ...(data && { data }),
});

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;

const isString = (v: unknown): v is string => typeof v === "string";
const trimOrUndef = (v: unknown): string | undefined => {
  if (!isString(v)) return undefined;
  const t = v.trim();
  return t ? t : undefined;
};

/** ดึงค่าจาก body โดยอนุญาต null (เพื่อเคลียร์ค่าใน DB) */
const pickNullableString = (body: unknown, key: string): string | null | undefined => {
  if (!isRecord(body)) return undefined;
  if (!(key in body)) return undefined;
  const v = (body as UnknownRecord)[key];
  if (v === null) return null;
  return trimOrUndef(v);
};

/* --------------------------------------------------------
 * Regex
 * ------------------------------------------------------ */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^0\d{9}$/;          
export const idNumberRegex = /^\d{13}$/;       // 13 หลัก
export const cardNameRegex = /^[a-zA-Z\s]*$/;
export const dobRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
export const numRegex = /\D/g;

/* --------------------------------------------------------
 * pickers / normalizers
 * ------------------------------------------------------ */
export const normalizeString = trimOrUndef;

export const pickDobYmd = (body: unknown): string | undefined => {
  const raw = isRecord(body) ? trimOrUndef(body["dob"]) : undefined;
  if (!raw) return undefined;
  return dobRegex.test(raw) ? raw : undefined;
};

export const pickIdNumber = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const candidate = (body["idNumber"] ?? body["id_number"]) as unknown;
  const raw = trimOrUndef(candidate);
  if (!raw) return undefined;
  const cleaned = raw.replace(/[\s-]/g, "");
  return idNumberRegex.test(cleaned) ? cleaned : undefined;
};

export const pickProfileImageUrl = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const candidate =
    body["profileImage"] ??
    body["profile_image"] ??
    body["profileImageUrl"] ??
    body["imageUrl"] ??
    body["image"];
  return trimOrUndef(candidate);
};

/** รองรับ null (ให้ FE ส่ง null มาเพื่อลบค่าได้) */
export const pickProfileImagePublicId = (
  body: unknown
): string | null | undefined => {
  // ให้รองรับหลายชื่อ field
  const keys = [
    "profile_image_public_id",
    "profileImagePublicId",
    "public_id",
    "publicId",
  ];
  for (const k of keys) {
    const v = pickNullableString(body, k);
    if (v !== undefined) return v; // เจอ key นี้ใน body แล้ว (อาจเป็น string หรือ null)
  }
  return undefined;
};

/* --------------------------------------------------------
 * Zod schema (เพิ่ม idNumber และรองรับ public_id = null)
 * ------------------------------------------------------ */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  // NOTE: ที่นี่ปล่อยรูปแบบกว้างกว่าเล็กน้อย (9-15 หลัก) เพื่อรองรับเคส intl
  // ฝั่ง format/validate แยกอีกชั้นสำหรับไทย
  phone: z.string().trim().regex(/^\d{9,15}$/).optional(),
  idNumber: z.string().regex(idNumberRegex).optional(),
  dob: z.string().regex(dobRegex).optional(),
  profileImage: z.string().url().optional(),
  profile_image_public_id: z.string().min(1).optional().or(z.literal(null)),
});

export type ValidationDetails = z.inferFlattenedErrors<typeof updateProfileSchema>;

/* --------------------------------------------------------
 * Validators calling APIs
 * ------------------------------------------------------ */
async function fetchData<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const { data } = await axios.post<T>(url, body);
    return data;
  } catch (e) {
    console.error(`${url} request failed:`, e);
    return null;
  }
}

/* --------------------------------------------------------
 * Validate: email / phone / thai id
 * ------------------------------------------------------ */
export const validateEmail = async (
  value: string,
  role_ids?: number,
  checkConflict = false
): Promise<FieldValidation> => {
  const fmt = formatEmail(value);
  if (fmt.message) return fmt;

  if (checkConflict) {
    const conflict = await checkEmailConflictAndGetRole(value, role_ids);
    if (conflict) return conflict;
  }
  return result();
};

export const validatePhone = async (value: string): Promise<FieldValidation> => {
  if (!value.trim()) return result("Please input your Phone");

  const fmt = formatPhone(value);
  if (fmt.message) return fmt;

  try {
    const data = await fetchData<{ exists: boolean }>(`/api/user/check-phone`, {
      phone: value,
    });
    if (data?.exists) return result("This phone number is already registered");
  } catch (e) {
    console.error("Phone check failed:", e);
  }
  return result();
};

/** ตรวจเลข ปชช.ไทย: 13 หลัก + checksum + ไม่นับเลขซ้ำๆ 13 หลัก */
export const validateIdNumber = (value: string): FieldValidation => {
  const raw = value.trim();
  if (!raw) return result(); // optional field

  const cleaned = raw.replace(/[\s-]/g, "");
  if (!idNumberRegex.test(cleaned)) {
    return result("ID Number must be 13 digits");
  }
  if (/^(\d)\1{12}$/.test(cleaned)) {
    return result("Invalid ID Number");
  }
  if (!isValidThaiCitizenId(cleaned)) {
    return result("Invalid ID Number (checksum)");
  }
  return result();
};

/* --------------------------------------------------------
 * Password / Card validators
 * ------------------------------------------------------ */
export const validatePassword = (value: string): FieldValidation => {
  if (!value.trim()) return result("Please input your Password");
  if (value.length < 8) return result("Password must be more than 8 characters");
  return result();
};

export const validateCardNumber = (value: string): FieldValidation => {
  const cleaned = value.replace(/\s/g, "");
  if (!cleaned) return result("Card number is required");
  if (!/^\d+$/.test(cleaned)) return result("Card number must contain only numbers");
  if (cleaned.length < 13 || cleaned.length > 19)
    return result("Card number must be between 13-19 digits");
  if (!isValidLuhn(cleaned)) return result("Invalid card number");
  return result();
};

export const validateExpiryDate = (value: string): FieldValidation => {
  const cleaned = value.replace(numRegex, "");
  if (!cleaned) return result("Expiry date is required");

  // ใช้รูปแบบ MM/YYYY
  if (cleaned.length !== 6) return result("Invalid expiry date format (MM/YYYY)");

  const month = parseInt(cleaned.substring(0, 2));
  const year = parseInt(cleaned.substring(2, 6));
  if (month < 1 || month > 12) return result("Invalid month (01-12)");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return result("Card has expired");
  }
  if (year > currentYear + 20) {
    return result("Expiry date too far in the future");
  }
  return result();
};

export const validateCVC = (value: string): FieldValidation => {
  const cleaned = value.replace(numRegex, "");
  if (!cleaned) return result("CVC is required");
  if (!/^\d{3,4}$/.test(cleaned)) return result("CVC must be 3 or 4 digits");
  return result();
};

/* --------------------------------------------------------
 * Conflict checks
 * ------------------------------------------------------ */
export const checkEmailConflictAndGetRole = async (
  value: string,
  role_ids?: number
) => {
  try {
    const data = await fetchData<{
      exists: boolean;
      data: { user_role: UserRole[] };
    }>("/api/user/get-role", { email: value });

    if (data?.exists && role_ids) {
      const hasRole = data.data.user_role.some(
        (ur: UserRole) => ur.role_id === role_ids
      );
      const msg = "This email is already registered";
      return hasRole ? result(msg, "Conflict", data) : result(msg, undefined, data);
    }
  } catch (e) {
    console.error("Email check failed:", e);
  }
  return undefined;
};

/* --------------------------------------------------------
 * Formatting
 * ------------------------------------------------------ */
export const formatEmail = (value: string) => {
  if (!value.trim()) return result("Please input your Email");
  if (!emailRegex.test(value)) return result("Invalid email format");
  return result();
};

export const formatPhone = (value: string) => {
  if (!phoneRegex.test(value))
    return result("Phone must start with 0 and be 10 digits");
  return result();
};

/** ใส่ขีด: 1-2345-67890-12-3 (ทำงานได้กับความยาวยังไม่ครบ) */
export const formatIdNumber = (value: string): string => {
  const cleaned = value.replace(/[\s-]/g, "").slice(0, 13);
  // ตัดเป็นชิ้น ๆ ตาม 1-4-5-2-1
  const p1 = cleaned.slice(0, 1);
  const p2 = cleaned.slice(1, 5);
  const p3 = cleaned.slice(5, 10);
  const p4 = cleaned.slice(10, 12);
  const p5 = cleaned.slice(12, 13);
  return [p1, p2, p3, p4, p5].filter(Boolean).join("-");
};

/* --------------------------------------------------------
 * Algorithms
 * ------------------------------------------------------ */
const isValidLuhn = (cardNumber: string): boolean => {
  let sum = 0;
  let isEven = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

/** ตรวจ checksum ของบัตรประชาชนไทย */
const isValidThaiCitizenId = (digits13: string): boolean => {
  if (!idNumberRegex.test(digits13)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits13[i], 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(digits13[12], 10);
};

/* --------------------------------------------------------
 * Card formatting
 * ------------------------------------------------------ */
export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
};

export const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(numRegex, "").slice(0, 6); // MMYYYY
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 6)}`;
};

export const formatCVC = (value: string): string => {
  return value.replace(numRegex, "").substring(0, 4);
};