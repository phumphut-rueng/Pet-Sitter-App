//  เช็คว่าบัญชีนี้เป็น "password" หรือ "google"
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "email required" });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });
    if (!user) return res.status(200).json({ flow: "unknown" });

    const googleAcc = await prisma.account.findFirst({
      where: { userId: user.id, provider: "google" },
      select: { id: true },
    });

    // ถ้ามี Google และ password ว่าง  ถือเป็น Google-only
    if (googleAcc && !user.password) {
      return res.status(200).json({ flow: "google" });
    }
    return res.status(200).json({ flow: "password" });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ flow: "unknown" });
  }
}