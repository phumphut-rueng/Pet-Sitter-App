import { prisma } from "@/lib/prisma/prisma";

export type UpdateData = Parameters<typeof prisma.user.update>[0]["data"];

export const userRepository = {
  findById: async (userId: number) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        profile_image: true,
        profile_image_public_id: true,
      },
    }),

  updateById: async (userId: number, data: UpdateData) =>
    prisma.user.update({ where: { id: userId }, data: { ...data, updated_at: new Date() } }),
};