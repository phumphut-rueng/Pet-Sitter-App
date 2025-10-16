import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const sub = session?.user?.id;
  const userId = sub ? Number(sub) : NaN;

  if (!sub || !Number.isFinite(userId)) {
    return res.status(200).json({ isSitter: false });
  }

  try {
    const sitter = await prisma.sitter.findFirst({
      where: { user_sitter_id: userId },
      select: { id: true },
    });
    return res.status(200).json({ isSitter: !!sitter });
  } catch {
    // อย่าทำให้ navbar พังเพราะ error — ส่ง false ไป
    return res.status(200).json({ isSitter: false });
  }
}