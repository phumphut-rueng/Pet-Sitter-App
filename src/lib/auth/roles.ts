export const ROLES = {
  ADMIN: "admin",
  SITTER: "sitter",
  OWNER: "owner", // จะ map "user"  "owner" ด้วย
  USER:  "user",
} as const;
export type Role = typeof ROLES[keyof typeof ROLES];


export function normalizeRole(x: unknown): Role | null {
  if (typeof x !== "string") return null;
  const k = x.trim().toLowerCase();
  if (k === "admin")  return ROLES.ADMIN;
  if (k === "sitter") return ROLES.SITTER;
  if (k === "owner")  return ROLES.OWNER;
  if (k === "user")   return ROLES.OWNER; // ถ้า DB ส่ง "user" มา ให้ถือเป็น owner
  return null;
}

export function isRole(x: unknown): x is Role {
  return normalizeRole(x) !== null;
}

export function hasAny(userRoles: Array<string | Role>, required: Role[]): boolean {
  const set = new Set(userRoles.map(normalizeRole).filter(Boolean) as Role[]);
  return required.some((r) => set.has(r));
}
export function hasAll(userRoles: Array<string | Role>, required: Role[]): boolean {
  const set = new Set(userRoles.map(normalizeRole).filter(Boolean) as Role[]);
  return required.every((r) => set.has(r));
}

// ---- กฎเส้นทาง ----
export type Rule = { anyOf: Role[] } | { allOf: Role[] };
export type RouteRules = Record<string, Rule>;

export const routeRules: RouteRules = {
  "/admin":            { anyOf: [ROLES.ADMIN] },
  "/admin-management": { anyOf: [ROLES.ADMIN] },
  "/sitter":           { anyOf: [ROLES.SITTER] },
  "/pet-sitter":       { anyOf: [ROLES.SITTER] },
  "/account":          { anyOf: [ROLES.OWNER, ROLES.ADMIN] },
  //"/profile":          { anyOf: [ROLES.OWNER, ROLES.ADMIN] },
};

// ---- Admin Resolver for API Routes ----
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";
import { toPositiveInt } from "@/lib/api/api-utils";

/**
 * หา adminId จาก session หรือ header x-user-id (fallback สำหรับ internal tools)
 */
export async function getAdminIdFromRequest(
  req: NextApiRequest, 
  res: NextApiResponse
): Promise<number | null> {
  try {
    const session = await getServerSession(req, res, authOptions);
    const uid = Number(session?.user?.id);
    if (Number.isFinite(uid)) {
      const admin = await prisma.admin.findUnique({ where: { user_id: uid } });
      if (admin) return admin.id;
    }
  } catch {
    // ignore – จะลองจาก header ต่อ
  }

  const hdr = toPositiveInt(req.headers["x-user-id"]);
  if (!hdr) return null;

  const admin = await prisma.admin.findUnique({ where: { user_id: hdr } });
  return admin?.id ?? null;
}