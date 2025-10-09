//Validation Helper Functionsรวม utility functions สำหรับ validation ที่ใช้ร่วมกันได้

import { api } from "@/lib/api/axios"; 
import { sanitize } from "@/lib/utils/strings";

// Unique Validation Function (ย้ายมาจาก api-client.ts)

export type ValidationField = "name" | "email" | "phone";

//เช็คว่า field ซ้ำหรือไม่
//เรียก API: /api/user/get-role หรือ /api/user/check-phone
//  Response: { exists: boolean }
//  ถ้า exists = true throw error

export async function checkUnique(
  field: ValidationField,
  value: string
): Promise<void> {
  // ถ้าเป็น name ยังไม่มี API ให้ return ไปก่อน
  if (field === "name") {
    return;
  }

  // กำหนด endpoint และ body ตาม field
  let endpoint = "";
  let body: Record<string, string> = {};

  if (field === "email") {
    endpoint = "/user/get-role"; 
    body = { email: value };
  } else if (field === "phone") {
    endpoint = "/user/check-phone";
    body = { phone: value };
  }

  // เรียก API
  const response = await api.post<{ exists: boolean }>(endpoint, body);

  // ถ้า exists = true แปลว่าซ้ำ  throw error
  if (response.data.exists) {
    throw new Error(`${field}_taken`);
  }
}

// ========================================
// Error Messages
// ========================================

export const VALIDATION_ERROR_MESSAGES = {
  // Unique validation
  nameTaken: "This name is already in use.",
  emailTaken: "This email is already in use.",
  phoneTaken: "This phone number is already in use.",

  // Format validation
  invalidEmail: "Please enter a valid email address.",
  invalidPhone: "Please enter a valid phone number.",
  invalidDate: "Invalid date. Use YYYY-MM-DD.",

  // Required fields
  required: "This field is required.",

  // Generic
  unknown: "Unknown error",
} as const;

// Async Validators (สำหรับ react-hook-form) 

//ตรวจสอบว่า email ซ้ำหรือไม่ (async validator) @returns true ถ้าไม่ซ้ำ, error message ถ้าซ้ำ
export async function validateEmailUnique(email: string): Promise<true | string> {
  const sanitizedEmail = sanitize.trimString(email);
  if (!sanitizedEmail) return true;

  try {
    await checkUnique("email", sanitizedEmail);
    return true;
  } catch {
    return VALIDATION_ERROR_MESSAGES.emailTaken;
  }
}


//ตรวจสอบว่า phone ซ้ำหรือไม่ (async validator) returns true ถ้าไม่ซ้ำ, error message ถ้าซ้ำ
export async function validatePhoneUnique(phone: string): Promise<true | string> {
  const sanitizedPhone = sanitize.onlyDigits(phone);
  if (!sanitizedPhone) return true;

  try {
    await checkUnique("phone", sanitizedPhone);
    return true;
  } catch {
    return VALIDATION_ERROR_MESSAGES.phoneTaken;
  }
}

//ตรวจสอบว่า name ซ้ำหรือไม่ (async validator)returns true ถ้าไม่ซ้ำ, error message ถ้าซ้ำ
 
export async function validateNameUnique(name: string): Promise<true | string> {
  const sanitizedName = sanitize.trimString(name);
  if (!sanitizedName) return true;

  try {
    await checkUnique("name", sanitizedName);
    return true;
  } catch {
    return VALIDATION_ERROR_MESSAGES.nameTaken;
  }
}


// Batch Validation

export type UniqueFieldError = {
  field: "name" | "email" | "phone";
  message: string;
};

//ตรวจสอบ unique fields พร้อมกัน @param fields - fields ที่ต้องการเช็ค (เฉพาะที่มีค่า) @returns array ของ errors ที่เจอ
export async function validateUniqueFields(fields: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<UniqueFieldError[]> {
  const tasks: Array<{ field: "name" | "email" | "phone"; promise: Promise<void> }> = [];

  if (fields.name) {
    tasks.push({
      field: "name",
      promise: checkUnique("name", sanitize.trimString(fields.name)),
    });
  }

  if (fields.email) {
    tasks.push({
      field: "email",
      promise: checkUnique("email", sanitize.trimString(fields.email)),
    });
  }

  if (fields.phone) {
    tasks.push({
      field: "phone",
      promise: checkUnique("phone", sanitize.onlyDigits(fields.phone)!),
    });
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


// Utility: Check Field Changes

//ปรียบเทียบค่าเดิมกับค่าใหม่ว่ามีการเปลี่ยนแปลงหรือไม่ใช้ unknown แทน any *****เพื่อให้ type ปลอดภัย
//initial เป็น Partial<T> | null รองรับกรณี field ขาดหาย
//คืนค่าเป็น Record<keyof T, boolean>
export function checkFieldChanges<T extends Record<string, unknown>>(
  initial: Partial<T> | null,
  current: T,
  fields: Array<keyof T>
): Record<keyof T, boolean> {
  const changes = {} as Record<keyof T, boolean>;

  fields.forEach((field) => {
    const initialValue = (initial?.[field] ?? "") as unknown;
    const currentValue = (current[field] ?? "") as unknown;

    // Normalize values ตามชนิดฟิลด์
    let normalizedInitial: string;
    let normalizedCurrent: string;

    if (field === ("phone" as keyof T)) {
      normalizedInitial = sanitize.onlyDigits(String(initialValue)) ?? "";
      normalizedCurrent = sanitize.onlyDigits(String(currentValue)) ?? "";
    } else {
      normalizedInitial = sanitize.trimString(String(initialValue)) ?? "";
      normalizedCurrent = sanitize.trimString(String(currentValue)) ?? "";
    }

    changes[field] = normalizedInitial !== normalizedCurrent;
  });

  return changes;
}