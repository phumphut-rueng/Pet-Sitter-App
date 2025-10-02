import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const email = (req.body?.email ?? "").trim();
  const excludeId = Number(req.body?.excludeUserId) || undefined;

  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!emailPattern.test(email))
    return res.status(400).json({ message: "Invalid email format" });

  try {
    const exists = !!(await prisma.user.findFirst({
      where: { email, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    }));

    return exists
      ? res.status(409).json({ exists: true, message: "Email already exists" })
      : res.status(200).json({ exists: false });
  } catch (e) {
    console.error("check-email error:", e);
    return res
      .status(500)
      .json({ message: "Server error while checking email" });
  }
}
