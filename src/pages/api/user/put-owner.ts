import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { allowMethods, getUserId, handleApiError } from "@/lib/server/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ["PUT"])) return;

  try {
    const userId = await getUserId(req);
    const { name, email, phone, dob, profileImage } = req.body as {
      name?: string; email?: string; phone?: string; dob?: string; profileImage?: string;
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        dob: dob ? new Date(dob) : undefined,
        profile_image: profileImage ?? undefined,
        updated_at: new Date(),
      },
      select: {
        id: true, name: true, email: true, phone: true, dob: true, profile_image: true, updated_at: true,
      },
    });

    return res.status(200).json({ message: "Updated", data: updated });
  } catch (err) {
    return handleApiError(res, err, "Failed to update profile");
  }
}