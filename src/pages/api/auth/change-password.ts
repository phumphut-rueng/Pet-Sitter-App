//  ADDED: เปลี่ยนรหัสผ่านสำหรับผู้ใช้ธรรมดา (ล็อกอินอยู่)
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/prisma";
import { PASSWORD_ERROR_MESSAGES, PASSWORD_SUCCESS_MESSAGES } from "@/lib/constants/messages";

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Change password (by email)
 *     description: >
 *       Change user password by email. **Note:** this endpoint, as implemented,
 *       does not verify current password or session. Consider requiring a session
 *       cookie or currentPassword to prevent account takeover.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               newPassword:
 *                 type: string
 *                 description: Must contain letters and digits, length >= 8
 *           examples:
 *             sample:
 *               value:
 *                 email: "john@example.com"
 *                 newPassword: "Newpass123"
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema: { type: object }
 *       400:
 *         description: Missing data / invalid email / user not found / weak password
 *       403:
 *         description: Google account not allowed to set password here
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Unknown error
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const newPassword = String(req.body?.newPassword || "");
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: PASSWORD_ERROR_MESSAGES.missingData });
    }
    
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
      return res.status(400).json({ message: PASSWORD_ERROR_MESSAGES.passwordRequirements });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });
    
    if (!user) {
      return res.status(400).json({ message: PASSWORD_ERROR_MESSAGES.userNotFound });
    }

    // กันผู้ใช้ Google
    const googleAcc = await prisma.account.findFirst({
      where: { userId: user.id, provider: "google" },
      select: { id: true },
    });
    
    if (googleAcc && !user.password) {
      return res.status(403).json({ message: PASSWORD_ERROR_MESSAGES.googleAccountRestriction });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { password: hashed } 
    });

    return res.status(200).json({ message: PASSWORD_SUCCESS_MESSAGES.passwordChanged });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: PASSWORD_ERROR_MESSAGES.unknown });
  }
}