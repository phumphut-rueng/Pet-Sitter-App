import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuth, type AuthenticatedRequest } from "@/middlewares/auth";

export default requireAuth(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const userId = req.user!.id;

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        profile_image: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      dob: user.dob ? user.dob.toISOString().slice(0, 10) : "",
      profileImage: user.profile_image ?? "",
    });
  }

  if (req.method === "PUT") {
    const { name, email, phone, dob, profileImage } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      dob?: string; // "YYYY-MM-DD"
      profileImage?: string;
    };

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        dob: dob ? new Date(dob) : undefined,
        profile_image: profileImage ?? undefined,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({ message: "OK" });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: "Method not allowed" });
});