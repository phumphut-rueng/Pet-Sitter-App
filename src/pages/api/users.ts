import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     description: Return a list of users. (ควรจำกัดฟิลด์ที่ส่งกลับด้วย `select` เพื่อหลีกเลี่ยงข้อมูลอ่อนไหว)
 *     security:
 *       - cookieAuth: []
 *       - AdminApiKey: []
 *     responses:
 *       '200':
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 123
 *                   name:
 *                     type: string
 *                     nullable: true
 *                     example: "Jane Doe"
 *                   email:
 *                     type: string
 *                     nullable: true
 *                     example: "jane@example.com"
 *                   phone:
 *                     type: string
 *                     nullable: true
 *                     example: "0812345678"
 *                   profile_image:
 *                     type: string
 *                     nullable: true
 *                     example: "https://cdn.example.com/u/123.png"
 *                   created_at:
 *                     type: string
 *                     example: "2025-10-21T12:00:00.000Z"
 *       '405':
 *         description: Method not allowed
 *       '500':
 *         description: Internal Server Error
 */


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const users = await prisma.user.findMany();
      return res.status(200).json(users);
    }

    // 405: method ไม่อนุญาต
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("users api error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}