//  Reset Password สำหรับผู้ใช้ปกติ
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/prisma";
import { PASSWORD_ERROR_MESSAGES, PASSWORD_SUCCESS_MESSAGES } from "@/lib/constants/messages";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const token = String(req.body?.token || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: PASSWORD_ERROR_MESSAGES.missingData });
    }
    
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
      return res.status(400).json({ message: PASSWORD_ERROR_MESSAGES.passwordRequirements });
    }

    const user = await prisma.user.findUnique({ 
      where: { email }, 
      select: { id: true } 
    });
    
    if (!user) {
      return res.status(400).json({ message: PASSWORD_ERROR_MESSAGES.invalidToken });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const rec = await prisma.password_reset_tokens.findFirst({
      where: { 
        user_id: user.id, 
        token: tokenHash, 
        expires_at: { gt: new Date() } 
      },
    });
    
    if (!rec) {
      return res.status(400).json({ message: PASSWORD_ERROR_MESSAGES.invalidToken });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({ 
        where: { id: user.id }, 
        data: { password: hashed } 
      }),
      prisma.password_reset_tokens.delete({ 
        where: { id: rec.id } 
      }),
    ]);

    return res.status(200).json({ message: PASSWORD_SUCCESS_MESSAGES.passwordReset });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: PASSWORD_ERROR_MESSAGES.unknown });
  }
}