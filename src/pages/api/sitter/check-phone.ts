import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const phonePattern = /^0\d{9}$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const phone = (req.body?.phone ?? "").trim();
  const excludeId = Number(req.body?.excludeUserId) || undefined;

  if (!phone) return res.status(400).json({ message: "Phone is required" });
  if (!phonePattern.test(phone))
    return res.status(400).json({ message: "Invalid phone format" });

  try {
    const exists = !!(await prisma.user.findFirst({
      where: { phone, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    }));

    return exists
      ? res.status(409).json({ exists: true, message: "Phone already exists" })
      : res.status(200).json({ exists: false });
  } catch (e) {
    console.error("check-phone error:", e);
    return res
      .status(500)
      .json({ message: "Server error while checking phone" });
  }
}
