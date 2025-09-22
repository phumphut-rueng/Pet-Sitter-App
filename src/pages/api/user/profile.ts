import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { allowMethods, getUserId, handleApiError } from "@/lib/server/api";
import { toOwnerProfileDto } from "@/lib/server/user-map";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    const userId = await getUserId(req);

    const u = await prisma.user.findFirst({
      where: {
        id: userId,
        // ถ้าจะบังคับเฉพาะ Owner เปิดบรรทัดล่าง
        // user_role: { some: { role_id: 2 } },
      },
      select: {
        id: true, name: true, email: true, phone: true, dob: true, profile_image: true,
      },
    });

    if (!u) return res.status(404).json({ error: "User not found" });

    return res.status(200).json(toOwnerProfileDto(u));
  } catch (err) {
    return handleApiError(res, err, "Failed to fetch profile");
  }
}