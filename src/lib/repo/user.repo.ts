import { prisma } from "@/lib/prisma/prisma";

// ใช้ type จาก Prisma โดยตรง ป้องกันฟิลด์ตกหล่น
export type UpdateData = Parameters<typeof prisma.user.update>[0]["data"];

const USER_SELECT_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  id_number: true,
  dob: true,
  profile_image: true,
  profile_image_public_id: true,
} as const;

export const userRepository = {
  findById: (userId: number) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT_FIELDS,
    }),

  updateById: (userId: number, data: UpdateData) =>
    prisma.user.update({
      where: { id: userId },
      data: { ...data, updated_at: new Date() },
    }),
};