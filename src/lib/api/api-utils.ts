import type { NextApiRequest, NextApiResponse } from "next";
import { isAxiosError } from "axios";

/* ----------------------------------------
 * Types / Utils
 * -------------------------------------- */
type QueryObject = Record<string, unknown>;

/** ดึงค่าตัวแรกออกมาเป็น string (จาก unknown / string / string[] / number) */
function getFirstParam(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "string") return first;
    if (typeof first === "number" && Number.isFinite(first)) return String(first);
    // เผื่อกรณี array ปะปนชนิด อื่น ๆ
    try {
      return String(first);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 *  แปลง query parameter เป็น number ID
 *
 * รองรับทั้ง string, string[], และ object query
 * @param query - ค่าจาก req.query
 * @param fallbackKey - ชื่อ key สำรอง (เช่น "id", "ownerId")
 * @returns number | null
 *
 * @example
 * parseId(req.query.ownerId) // ใช้กับ [ownerId] dynamic route
 * parseId(req.query.id) // ใช้กับ ?id=123
 */
export function parseId(
  query: string | string[] | QueryObject | null | undefined,
  fallbackKey?: string
): number | null {
  let raw: unknown = query;

  // ถ้า query เป็น object และมี fallbackKey ให้ลองหาจาก key นั้นก่อน (ไม่ใช้ any)
  if (
    query !== null &&
    typeof query === "object" &&
    !Array.isArray(query) &&
    fallbackKey
  ) {
    const obj = query as QueryObject;
    raw = obj[fallbackKey] ?? obj.id;
  }

  const value = getFirstParam(raw);
  const num = value !== undefined ? Number(value) : NaN;

  // ต้องเป็นตัวเลขที่มากกว่า 0
  return Number.isFinite(num) && num > 0 ? Math.trunc(num) : null;
}

/**
 *  แปลงค่าเป็น integer (ใช้สำหรับ pagination)
 *
 * @param value - ค่าที่ต้องการแปลง
 * @param defaultValue - ค่า default ถ้าแปลงไม่ได้
 * @returns integer
 *
 * @example
 * toInt(req.query.page, 1) // default page = 1
 * toInt(req.query.limit, 10) // default limit = 10
 */
export function toInt(value: unknown, defaultValue: number): number {
  const str = getFirstParam(value);
  const num = str !== undefined ? Number(str) : NaN;
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : defaultValue;
}

/**
 *  แปลง error เป็น error message string
 *
 * รองรับทั้ง Axios Error, Error object, และ string
 * @param error - error object
 * @param fallback - ข้อความ fallback
 * @returns error message
 *
 * @example
 * catch (err) {
 *   const message = getErrorMessage(err, "Failed to load data");
 * }
 */
export function getErrorMessage(error: unknown, fallback = "Unknown error"): string {
  // Axios Error
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return (
      data?.message ||
      data?.error ||
      error.response?.statusText ||
      error.message ||
      fallback
    );
    // หมายเหตุ: isAxiosError ทำให้ error.message เป็น string ได้อย่างปลอดภัย
  }

  // Error object
  if (error instanceof Error) return error.message;

  // String
  if (typeof error === "string") return error;

  // Unknown
  return fallback;
}

/**
 *  Error Handler Wrapper สำหรับ API Routes
 *
 * จัดการ try-catch และ error logging อัตโนมัติ
 * @param handler - API handler function
 * @returns wrapped handler
 *
 * @example
 * export default apiHandler(async (req, res) => {
 *   // your code here
 * });
 */
export function apiHandler<T = unknown>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T | void>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error("API Error:", error);
      const message = getErrorMessage(error, "Internal server error");

      // ป้องกันส่ง response ซ้ำ
      if (!res.headersSent) {
        res.status(500).json({ message });
      }
    }
  };
}

/**
 *  Middleware: เช็ค HTTP Method
 *
 * @param allowedMethods - array ของ methods ที่อนุญาต
 * @returns middleware function
 *
 * @example
 * // ในไฟล์ API:
 * if (!isMethodAllowed(req, ["GET", "POST"])) {
 *   return res.status(405).json({ message: "Method not allowed" });
 * }
 */
export function isMethodAllowed(
  req: NextApiRequest,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(req.method ?? "");
}

/**
 *  ส่ง Method Not Allowed response
 *
 * @example
 * if (req.method !== "GET") {
 *   return methodNotAllowed(res, ["GET"]);
 * }
 */
export function methodNotAllowed(
  res: NextApiResponse,
  allowedMethods: string[]
) {
  res.setHeader("Allow", allowedMethods);
  return res.status(405).json({ message: "Method not allowed" });
}