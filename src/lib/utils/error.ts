export type ApiErrorPayload = { message: string; [k: string]: unknown };

function isApiErrorPayload(x: unknown): x is ApiErrorPayload {
  return !!x && typeof x === "object" && typeof (x as Record<string, unknown>).message === "string";
}

/**
 * ดึงข้อความ error จาก API response, Error instance, หรือ string
 * รองรับทั้ง Axios error และ standard Error object
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (typeof error === "string") return error;
  if (isApiErrorPayload(error)) return error.message;

  const axiosError = error as { response?: { data?: unknown } };
  if (axiosError?.response?.data && isApiErrorPayload(axiosError.response.data)) {
    return axiosError.response.data.message;
  }

  if (error instanceof Error) return error.message;

  const errorObj = error as { message?: unknown };
  if (errorObj?.message && typeof errorObj.message === "string") {
    return errorObj.message;
  }

  return fallback;
}

/**
 * แปลง error เป็น string (สำหรับ logging)
 */
export function toErrorMessage(e: unknown, fallback = "Unknown error"): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { 
    return JSON.stringify(e); 
  } catch { 
    return fallback; 
  }
}