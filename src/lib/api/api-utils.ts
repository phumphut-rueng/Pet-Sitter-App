import type { NextApiRequest, NextApiResponse } from "next";
import { getErrorMessage } from "@/lib/utils/error";

type QueryObject = Record<string, unknown>;

/** ดึงค่าตัวแรกออกมาเป็น string (จาก unknown / string / string[] / number) */
function getFirstParam(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "string") return first;
    if (typeof first === "number" && Number.isFinite(first)) return String(first);
    try {
      return String(first);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * แปลง query parameter เป็น number ID
 */
export function parseId(
  query: string | string[] | QueryObject | null | undefined,
  fallbackKey?: string
): number | null {
  let raw: unknown = query;

  if (query !== null && typeof query === "object" && !Array.isArray(query) && fallbackKey) {
    const obj = query as QueryObject;
    raw = obj[fallbackKey] ?? obj.id;
  }

  const value = getFirstParam(raw);
  const num = value !== undefined ? Number(value) : NaN;

  return Number.isFinite(num) && num > 0 ? Math.trunc(num) : null;
}

/**
 * แปลงค่าเป็น integer (ใช้สำหรับ pagination)
 */
export function toInt(value: unknown, defaultValue: number): number {
  const str = getFirstParam(value);
  const num = str !== undefined ? Number(str) : NaN;
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : defaultValue;
}

/**
 * แปลงค่าเป็น positive integer หรือ null (ใช้สำหรับ ID validation)
 */
export function toPositiveInt(value: unknown): number | null {
  const str = getFirstParam(value);
  const num = str !== undefined ? Number(str) : NaN;
  return Number.isInteger(num) && num > 0 ? num : null;
}

/**
 * ส่ง error response แบบง่าย
 */
export function sendError(
  res: NextApiResponse,
  status: number,
  message: string,
  extra?: Record<string, unknown>
) {
  return res.status(status).json({ message, ...(extra ?? {}) });
}

/**
 * Error Handler Wrapper สำหรับ API Routes (ไม่ใช้ any)
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

      // ส่ง error response ถ้ายังไม่ส่ง header ออกไป
      try {
        if (!res.headersSent) {
          res.status(500).json({ message });
        }
      } catch (sendErr) {
        console.error("API Error (while sending error response):", sendErr);
      }
    }
  };
}

/**
 * เช็ค HTTP Method
 */
export function isMethodAllowed(
  req: NextApiRequest,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(req.method ?? "");
}

/**
 * ส่ง Method Not Allowed response
 */
export function methodNotAllowed(
  res: NextApiResponse,
  allowedMethods: string[]
) {
  res.setHeader("Allow", allowedMethods);
  return res.status(405).json({ message: "Method not allowed" });
}