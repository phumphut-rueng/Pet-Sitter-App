import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /user/check-phone:
 *   post:
 *     tags: [User]
 *     summary: Check if phone number already exists
 *     description: "Return `exists: true` if the phone number is already used."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *     responses:
 *       '200':
 *         description: Check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: false
 *       '400':
 *         description: Missing phone
 *       '405':
 *         description: Method not allowed
 *       '500':
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

        const { phone } = req.body as { phone?: string };

        if (!phone) {
            return res.status(400).json({
                message: "Phone is required"
            });
        }

        // ค้นหา phone ใน DB
        const existingUser = await prisma.user.findFirst({
            where: { phone },
        });

        if (existingUser) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("check-phone error:", error);
        return res.status(500).json({
            message: "Server could not get phone because database connection",
            details: String(error)
        });
    }
}
