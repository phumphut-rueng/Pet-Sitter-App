//รวม utility functions สำหรับ validation

import { api } from "@/lib/api/axios";
import { sanitizeDigits, trimString } from "@/lib/utils/strings";

export type ValidationField = "name" | "email" | "phone";

/**
 * เช็คว่า field ซ้ำหรือไม่
 * เรียก API: /api/user/get-role หรือ /api/user/check-phone
 * Response: { exists: boolean }
 * ถ้า exists = true throw error
 */
export async function checkUnique(field: ValidationField, value: string): Promise<void> {
  if (field === "name") return;

  let endpoint = "";
  let body: Record<string, string> = {};

  if (field === "email") {
    endpoint = "/user/get-role";
    body = { email: value };
  } else if (field === "phone") {
    endpoint = "/user/check-phone";
    body = { phone: value };
  }

  const response = await api.post<{ exists: boolean }>(endpoint, body);

  if (response.data.exists) {
    throw new Error(`${field}_taken`);
  }
}

export const VALIDATION_ERROR_MESSAGES = {
  nameTaken: "This name is already in use.",
  emailTaken: "This email is already in use.",
  phoneTaken: "This phone number is already in use.",
  invalidEmail: "Please enter a valid email address.",
  invalidPhone: "Please enter a valid phone number.",
  invalidDate: "Invalid date. Use YYYY-MM-DD.",
  required: "This field is required.",
  unknown: "Unknown error",
} as const;

/**
 * ตรวจสอบว่า email ซ้ำหรือไม่ (async validator)
 * @returns true ถ้าไม่ซ้ำ, error message ถ้าซ้ำ
 */
export async function validateEmailUnique(email: string): Promise<true | string> {
  const sanitized = trimString(email);
  if (!sanitized) return true;

  try {
    await checkUnique("email", sanitized);
    return true;
  } catch {
    return VALIDATION_ERROR_MESSAGES.emailTaken;
  }
}

/**
 * ตรวจสอบว่า phone ซ้ำหรือไม่ (async validator)
 * @returns true ถ้าไม่ซ้ำ, error message ถ้าซ้ำ
 */
export async function validatePhoneUnique(phone: string): Promise<true | string> {
  const sanitized = sanitizeDigits(phone);
  if (!sanitized) return true;

  try {
    await checkUnique("phone", sanitized);
    return true;
  } catch {
    return VALIDATION_ERROR_MESSAGES.phoneTaken;
  }
}

/**
 * ตรวจสอบว่า name ซ้ำหรือไม่ (async validator)
 * @returns true ถ้าไม่ซ้ำ, error message ถ้าซ้ำ
 */
export async function validateNameUnique(name: string): Promise<true | string> {
  const sanitized = trimString(name);
  if (!sanitized) return true;

  try {
    await checkUnique("name", sanitized);
    return true;
  } catch {
    return VALIDATION_ERROR_MESSAGES.nameTaken;
  }
}

export type UniqueFieldError = {
  field: "name" | "email" | "phone";
  message: string;
};

/**
 * ตรวจสอบ unique fields พร้อมกัน
 * @param fields - fields ที่ต้องการเช็ค (เฉพาะที่มีค่า)
 * @returns array ของ errors ที่เจอ
 */
export async function validateUniqueFields(fields: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<UniqueFieldError[]> {
  const tasks: Array<{ field: "name" | "email" | "phone"; promise: Promise<void> }> = [];

  if (fields.name) {
    tasks.push({
      field: "name",
      promise: checkUnique("name", trimString(fields.name)),
    });
  }

  if (fields.email) {
    tasks.push({
      field: "email",
      promise: checkUnique("email", trimString(fields.email)),
    });
  }

  if (fields.phone) {
    const sanitized = sanitizeDigits(fields.phone);
    if (sanitized) {
      tasks.push({
        field: "phone",
        promise: checkUnique("phone", sanitized),
      });
    }
  }

  if (tasks.length === 0) return [];

  const results = await Promise.allSettled(tasks.map((t) => t.promise));

  const errors: UniqueFieldError[] = [];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const field = tasks[index].field;
      const message =
        field === "name"
          ? VALIDATION_ERROR_MESSAGES.nameTaken
          : field === "email"
          ? VALIDATION_ERROR_MESSAGES.emailTaken
          : VALIDATION_ERROR_MESSAGES.phoneTaken;

      errors.push({ field, message });
    }
  });

  return errors;
}

/**
 * เปรียบเทียบค่าเดิมกับค่าใหม่ว่ามีการเปลี่ยนแปลงหรือไม่
 */
export function checkFieldChanges<T extends Record<string, unknown>>(
  initial: Partial<T> | null,
  current: T,
  fields: Array<keyof T>
): Record<keyof T, boolean> {
  const changes = {} as Record<keyof T, boolean>;

  fields.forEach((field) => {
    const initialValue = (initial?.[field] ?? "") as unknown;
    const currentValue = (current[field] ?? "") as unknown;

    let normalizedInitial: string;
    let normalizedCurrent: string;

    if (field === ("phone" as keyof T)) {
      normalizedInitial = sanitizeDigits(String(initialValue)) ?? "";
      normalizedCurrent = sanitizeDigits(String(currentValue)) ?? "";
    } else {
      normalizedInitial = trimString(String(initialValue)) ?? "";
      normalizedCurrent = trimString(String(currentValue)) ?? "";
    }

    changes[field] = normalizedInitial !== normalizedCurrent;
  });

  return changes;
}