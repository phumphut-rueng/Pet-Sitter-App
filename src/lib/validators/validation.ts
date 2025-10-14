import { z } from "zod";
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

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

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

// Regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^0\d{9}$/;
export const idNumberRegex = /^\d{13}$/; //  เพิ่ม regex สำหรับ ID Number
export const cardNameRegex = /^[a-zA-Z\s]*$/;
export const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
export const numRegex = /\D/g;

//ยังคิดไม่ออกว่าจะแก้ยังไง
export const normalizeString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
};

export const pickDobYmd = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const raw = normalizeString(body["dob"]);
  if (!raw) return undefined;
  return dobRegex.test(raw) ? raw : undefined;
};

//  เพิ่ม pickIdNumber helper
export const pickIdNumber = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const candidate = body["idNumber"] ?? body["id_number"];
  const raw = normalizeString(candidate);
  if (!raw) return undefined;
  // Remove dashes and spaces for validation
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

// อัพเดท schema เพิ่ม idNumber
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().regex(/^\d{9,15}$/).optional(),
  idNumber: z.string().regex(idNumberRegex).optional(), 
  dob: z.string().regex(dobRegex).optional(),
  profileImage: z.string().url().optional(),
  profile_image_public_id: z.string().min(1).optional().or(z.literal(null)),
});

export type ValidationDetails = z.inferFlattenedErrors<typeof updateProfileSchema>;

//validate
export const validateEmail = async (
  value: string,
  role_ids?: number,
  checkConflict = false,
): Promise<FieldValidation> => {
  formatEmail(value)

  if (checkConflict) {
    await checkEmailConflictAndGetRole(value, role_ids)
  }

  return { message: "" };
}

export const validatePhone = async (
  value: string
): Promise<FieldValidation> => {
  if (!value.trim())
    return result("Please input your Phone");

  formatPhone(value)

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

//  เพิ่ม validateIdNumber
export const validateIdNumber = (value: string): FieldValidation => {
  if (!value.trim()) {
    return { message: "" }; // Optional field
  }

  const cleaned = value.replace(/[\s-]/g, "");

  if (!idNumberRegex.test(cleaned)) {
    return result("ID Number must be 13 digits");
  }

  return { message: "" };
};

export const validatePassword = (
  value: string
): FieldValidation => {
  if (!value.trim())
    return result("Please input your Password");

  if (value.length < 8)
    return result("Password must be more than 8 characters");

  return result();
}

export const validateCardNumber = (value: string): FieldValidation => {
  const cleaned = value.replace(/\s/g, '');

  if (!cleaned) {
    return result("Card number is required");
  }

  if (!/^\d+$/.test(cleaned)) {
    return result("Card number must contain only numbers");
  }

  if (cleaned.length < 13 || cleaned.length > 19) {
    return result("Card number must be between 13-19 digits");
  }

  if (!isValidLuhn(cleaned)) {
    return result("Invalid card number");
  }

  return { message: "" };
};

export const validateExpiryDate = (value: string): FieldValidation => {
  const cleaned = value.replace(numRegex, '');

  if (!cleaned) {
    return result("Expiry date is required");
  }

  if (cleaned.length !== 6) {
    return result("Invalid expiry date format (MM/YYYY)");
  }

  const month = parseInt(cleaned.substring(0, 2));
  const year = parseInt(cleaned.substring(2, 6));

  if (month < 1 || month > 12) {
    return result("Invalid month (01-12)");
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return result("Card has expired");
  }

  if (year > currentYear + 20) {
    return result("Expiry date too far in the future");
  }

  return { message: "" };
};

export const validateCVC = (value: string): FieldValidation => {
  const cleaned = value.replace(numRegex, '');

  if (!cleaned) {
    return result("CVC is required");
  }

  if (!/^\d{3,4}$/.test(cleaned)) {
    return result("CVC must be 3 or 4 digits");
  }

  return { message: "" };
};

export const checkEmailConflictAndGetRole = async (
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

//Formatting Functions
export const formatEmail = (value: string) => {
  if (!value.trim())
    return result("Please input your Email");

  if (!emailRegex.test(value))
    return result("Invalid email format");

  return { message: "" };
}

export const formatPhone = (value: string) => {
  if (!phoneRegex.test(value))
    return result("Phone must start with 0 and be 10 digits");

  return { message: "" };
}

// เพิ่ม formatIdNumber
export const formatIdNumber = (value: string): string => {
  const cleaned = value.replace(/[\s-]/g, "");
  
  if (cleaned.length <= 13) {
    // Format: 1-2345-67890-12-3
    return cleaned.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5");
  }
  
  return cleaned;
};

const isValidLuhn = (cardNumber: string): boolean => {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

export const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(numRegex, '');
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 6)}`;
  }
  return cleaned;
};

export const formatCVC = (value: string): string => {
  return value.replace(numRegex, '').substring(0, 4);
};