import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // เทียบเท่า credentials: "include"
});

// Response interceptor - แปลง error ให้เป็น format เดียวกัน
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // ดึง message จาก response
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      "Unknown error";
    
    // Throw error ใหม่พร้อม message
    throw new Error(message);
  }
);

// ========================================
// Main API Request Function (ใช้ Axios)
// ========================================

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
  cache?: RequestCache; // เก็บไว้เพื่อ backward compatibility (แต่ไม่ใช้งาน)
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", body } = options;

  const config: AxiosRequestConfig = {
    url: path,
    method,
    data: body ? JSON.parse(body) : undefined,
  };

  const response = await axiosClient.request<T>(config);
  return response.data;
}

// ========================================
// Unique Validation Functions
// ========================================

export type ValidationField = "name" | "email" | "phone";

/**
 * เช็คว่า field ซ้ำหรือไม่
 * - เรียก API: /api/user/get-email//คนเปลี่ยนชื่อ หรือ /api/user/check-phone
 * - Response: { exists: boolean }
 * - ถ้า exists = true → throw error
 */
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
    endpoint = "/api/user/get-role";
    body = { email: value };
  } else if (field === "phone") {
    endpoint = "/api/user/check-phone";
    body = { phone: value };
  }

  // เรียก API
  const response = await axiosClient.post<{ exists: boolean }>(endpoint, body);

  // ถ้า exists = true แปลว่าซ้ำ → throw error
  if (response.data.exists) {
    throw new Error(`${field}_taken`);
  }
}