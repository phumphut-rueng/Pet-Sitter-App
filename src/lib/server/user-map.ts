// Map Prisma User -> DTO ที่ฝั่ง frontend ใช้ (camelCase)
import type { user } from "@prisma/client";

export const toOwnerProfileDto = (u: Pick<user, "id" | "name" | "email" | "phone" | "dob" | "profile_image">) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone ?? "",
  idNumber: "",                              // ยังไม่มีใน schema
  dob: u.dob ? u.dob.toISOString().slice(0, 10) : "",
  profileImage: u.profile_image ?? "",
});