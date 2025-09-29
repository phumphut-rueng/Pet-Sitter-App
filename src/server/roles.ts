// src/server/roles.ts
export const ROLE = {
  OWNER: "Owner",
  SITTER: "Sitter",
  ADMIN: "Admin",
} as const;

export type Role = typeof ROLE[keyof typeof ROLE];

export type RouteRule = {
  /** ผ่านถ้ามีบทบาทใดบทบาทหนึ่ง */
  anyOf?: Role[];
  /** ต้องมีบทบาทครบทุกตัว */
  allOf?: Role[];
};

/**
 * กฎต่อ prefix path — เลือก “prefix ที่ยาวสุด” ก่อนเสมอ (longest prefix wins)
 * - /account/profile → Owner/Admin เท่านั้น
 * - /account/pet     → Owner/Admin เท่านั้น
 * - /user/*          → Owner/Admin
 * - /sitter/*        → Sitter/Admin
 * - /admin/*         → Admin เท่านั้น
 * หมายเหตุ: หน้า /account อื่น ๆ (เช่น change-password) ไม่ระบุ rule → แค่ล็อกอินก็เข้าได้
 */
export const routeRules: Record<string, RouteRule> = {
  "/account/profile": { anyOf: [ROLE.OWNER, ROLE.ADMIN] },
  "/account/pet":     { anyOf: [ROLE.OWNER, ROLE.ADMIN] },

  "/user":            { anyOf: [ROLE.OWNER, ROLE.ADMIN] },
  "/sitter":          { anyOf: [ROLE.SITTER, ROLE.ADMIN] },
  "/admin":           { anyOf: [ROLE.ADMIN] },
};

// -------- helpers (รวมไว้ไฟล์เดียว เพื่อลดไฟล์ซ้ำซ้อน) --------
export function hasAny(userRoles: string[], required: Role[]): boolean {
  return required.some((r) => userRoles.includes(r));
}

export function hasAll(userRoles: string[], required: Role[]): boolean {
  return required.every((r) => userRoles.includes(r));
}