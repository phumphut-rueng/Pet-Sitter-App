import { useSession } from "next-auth/react";
import type { DefaultSession } from "next-auth";

/** โครง user ใน session ของเรา (รองรับ roles) */
type SessionUser = DefaultSession["user"] & {
  id?: string;
  roles?: string[];
};

/** ปรับรูปแบบตัวอักษรให้เทียบ role ได้แบบไม่พังเคส */
const norm = (s: string) => s.trim().toLowerCase();

/**
 * ใช้เช็คว่า "มีครบทุกบทบาทที่ต้องการ" หรือไม่
 * - required: string | string[]  (ถ้ามีหลายบทบาท จะเช็คแบบ every)
 */
export function useHasRole(required: string | string[]): boolean {
  const { data } = useSession();

  const user = (data?.user ?? null) as SessionUser | null;
  const have: ReadonlyArray<string> = (user?.roles ?? []).map(norm);

  const needs: ReadonlyArray<string> = Array.isArray(required)
    ? required.map(norm)
    : [norm(required)];

  // ถ้าไม่ต้องการบทบาทอะไรเลย → ผ่าน
  if (needs.length === 0) return true;

  // ต้องมีครบทุก role ที่ร้องขอ
  return needs.every((r) => have.includes(r));
}

/**
 * ถ้าต้องการเช็คแบบ "มีสักอันก็พอ" ใช้อันนี้
 */
export function useHasAnyRole(required: string | string[]): boolean {
  const { data } = useSession();

  const user = (data?.user ?? null) as SessionUser | null;
  const haveSet = new Set((user?.roles ?? []).map(norm));

  const needs: ReadonlyArray<string> = Array.isArray(required)
    ? required.map(norm)
    : [norm(required)];

  if (needs.length === 0) return true;

  return needs.some((r) => haveSet.has(r));
}