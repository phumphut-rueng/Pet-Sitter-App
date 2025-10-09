/**
 * Role Names Constants
 * 
 * ใช้สำหรับ query user roles ใน Prisma
 * รวมทุก variants ของชื่อ role ที่อาจมีในฐานข้อมูล
 */

/**
 *  Pet Owner Roles
 * ใช้สำหรับค้นหา users ที่เป็น Owner
 */
export const OWNER_ROLE_NAMES = [
    "Owner",
    "pet_owner",
    "OWNER",
    "PET_OWNER",
  ] as const;
  
  /**
   * Pet Sitter Roles
   * ใช้สำหรับค้นหา users ที่เป็น Sitter
   */
  export const SITTER_ROLE_NAMES = [
    "Sitter",
    "pet_sitter",
    "SITTER",
    "PET_SITTER",
  ] as const;
  
  /**
   *  Admin Roles
   * ใช้สำหรับค้นหา users ที่เป็น Admin
   */
  export const ADMIN_ROLE_NAMES = [
    "Admin",
    "ADMIN",
  ] as const;
  
  // ====================================
  // 📝 Type Helpers (optional)
  // ====================================
  
  export type OwnerRoleName = typeof OWNER_ROLE_NAMES[number];
  export type SitterRoleName = typeof SITTER_ROLE_NAMES[number];
  export type AdminRoleName = typeof ADMIN_ROLE_NAMES[number];
  export type RoleName = OwnerRoleName | SitterRoleName | AdminRoleName;