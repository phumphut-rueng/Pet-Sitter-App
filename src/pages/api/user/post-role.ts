import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /user/post-role:
 *   post:
 *     tags: [User]
 *     summary: Add a role to a user (by email)
 *     description: >
 *       เพิ่ม role ให้ผู้ใช้ด้วยอีเมลที่ระบุ ถ้าผู้ใช้มี role นั้นอยู่แล้วจะได้ 409.
 *       (หมายเหตุ: โค้ดปัจจุบัน **ยังไม่ได้**ตรวจสิทธิ์ — แนะนำให้ป้องกันเฉพาะแอดมิน)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role_ids]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               role_ids:
 *                 type: integer
 *                 example: 2
 *           examples:
 *             addOwnerRole:
 *               summary: Add role_id 2 (e.g. Owner)
 *               value: { email: "user@example.com", role_ids: 2 }
 *     responses:
 *       201:
 *         description: Role added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role added successfully
 *       400:
 *         description: Missing email or role_id
 *       404:
 *         description: User not found by given email
 *       409:
 *         description: User already has this role
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Server error
 *     security:
 *       - cookieAuth: []   # แนะนำให้ใช้ session-based auth
 */


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).end(`Method ${req.method} not allowed`);
    }

    try {
        const { email, role_ids } = req.body as {
            email?: string;
            role_ids?: number;
        };

        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }
        if (!role_ids) {
            return res.status(400).json({ message: "role_id is required" });
        }

        //check user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { user_role: true },
        });

        if (!user) {
            return res.status(404).json({
                message: "The provided email does not match any registered user",
            });
        }

        if (user.user_role.some((ur) => ur.role_id === role_ids)) {
            return res.status(409).json({
                message: "User already has this role",
            });
        }

        await prisma.$transaction([
            prisma.user_role.create({
                data: {
                    user_id: user.id,
                    role_id: role_ids,
                },
            }),
            prisma.user.update({
                where: { id: user.id },
                data: {
                    updated_at: new Date(),
                },
            }),
        ]);

        return res.status(201).json({
            message: "Role added successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server could not create role sitter because database connection",
            details: String(error),
        });
    }
}
