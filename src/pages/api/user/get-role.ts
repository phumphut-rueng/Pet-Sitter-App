import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

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
