import type { NextApiResponse } from "next";

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export function json<T>(res: NextApiResponse<T>, status: number, body: T) {
  return res.status(status).json(body);
}

export function toErrMsg(e: unknown, fallback = "Internal Server Error") {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch { return fallback; }
}