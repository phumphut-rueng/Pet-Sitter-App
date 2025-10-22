import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /user/is-sitter:
 *   get:
 *     tags: [User]
 *     summary: Check if current user is a sitter
 *     description: >
 *       Return `{ isSitter: boolean }` for the **currently logged-in** user (cookie-based session).
 *       หากยังไม่ล็อกอินหรือเกิดข้อผิดพลาด จะคืน `{ isSitter: false }` เสมอ
 *       เพื่อไม่ให้ UI ล้ม (เช่น navbar)
 *     responses:
 *       200:
 *         description: Result is always returned with HTTP 200 for robustness.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSitter:
 *                   type: boolean
 *                   example: true
 *             examples:
 *               sitter:
 *                 summary: User is a sitter
 *                 value: { isSitter: true }
 *               notSitterOrUnauthed:
 *                 summary: Not a sitter or not authenticated
 *                 value: { isSitter: false }
 *     security:
 *       - cookieAuth: []
 */


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