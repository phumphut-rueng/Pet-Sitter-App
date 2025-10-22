import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /user/get-role:
 *   post:
 *     tags: [User]
 *     summary: Get user roles by email
 *     description: Return whether the user exists and the user record (including user_role) for the given email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@example.com"
 *     responses:
 *       200:
 *         description: Found or not-found result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: True if user exists
 *                 data:
 *                   nullable: true
 *                   description: User object (includes user_role) when found, otherwise null
 *                   type: object
 *                   additionalProperties: true
 *             examples:
 *               found:
 *                 summary: User found
 *                 value:
 *                   exists: true
 *                   data:
 *                     id: 123
 *                     email: "jane@example.com"
 *                     name: "Jane"
 *                     user_role:
 *                       - id: 1
 *                         user_id: 123
 *                         role_id: 2
 *               notFound:
 *                 summary: User not found
 *                 value:
 *                   exists: false
 *                   data: null
 *       400:
 *         description: Missing email
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Server error
 */

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).end(`Method ${req.method} not allowed`);
    }

    try {
        const { email } = req.body as { email?: string };

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // ค้นหา email ใน DB
        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { user_role: true },
        });

        if (existingUser) {
            return res.status(200).json({
                exists: true,
                data: existingUser
            });
        } else {
            return res.status(200).json({
                exists: false,
                data: existingUser
            });
        }
    } catch (error) {
        console.error("check-email error:", error);
        return res.status(500).json({
            message: "Server could not get email because database connection",
            details: String(error)
        });
    }
}
